using System.Diagnostics;
using System.Drawing;
using System.IO.Compression;
using System.Net.Http.Headers;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Windows.Forms;

namespace Pedidos360Setup;

internal static class Program
{
    [STAThread]
    static void Main()
    {
        ApplicationConfiguration.Initialize();

        using var identity = System.Security.Principal.WindowsIdentity.GetCurrent();
        var principal = new System.Security.Principal.WindowsPrincipal(identity);

        if (!principal.IsInRole(System.Security.Principal.WindowsBuiltInRole.Administrator))
        {
            MessageBox.Show(
                "Abre el instalador y acepta el permiso de administrador de Windows.",
                "Pedidos360",
                MessageBoxButtons.OK,
                MessageBoxIcon.Warning
            );
            return;
        }

        Application.Run(new SetupForm());
    }
}

internal sealed class SetupForm : Form
{
    private const string ServerUrl = "https://pedidos360.shop";
    private const string TaskName = "Pedidos360PrintAgent";
    private const string InstallDir = @"C:\Program Files\Pedidos360\PrintAgent";
    private const string ConfigDir = @"C:\ProgramData\Pedidos360";

    private readonly TextBox token = new();
    private readonly ComboBox kitchen = new();
    private readonly ComboBox cashier = new();
    private readonly Label status = new();
    private readonly Button validate = new();
    private readonly Button install = new();
    private bool authenticated;

    public SetupForm()
    {
        Text = "Instalador de Pedidos360";
        StartPosition = FormStartPosition.CenterScreen;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        MinimizeBox = false;
        ClientSize = new Size(540, 440);
        Font = new Font("Segoe UI", 10);

        Controls.Add(new Label {
            Text = "Configuración de impresión",
            Font = new Font("Segoe UI", 19, FontStyle.Bold),
            AutoSize = true,
            Location = new Point(28, 24)
        });

        AddLabel("Token del agente", 30, 90);
        token.Location = new Point(30, 120);
        token.Size = new Size(475, 30);
        token.UseSystemPasswordChar = true;
        Controls.Add(token);

        AddLabel("Impresora de cocina", 30, 175);
        ConfigureCombo(kitchen, 205);

        AddLabel("Impresora de caja", 30, 255);
        ConfigureCombo(cashier, 285);

        validate.Text = "Validar conexión";
        validate.Location = new Point(30, 345);
        validate.Size = new Size(175, 42);
        validate.Click += async (_, _) => await ValidateToken();
        Controls.Add(validate);

        install.Text = "Instalar agente";
        install.Location = new Point(330, 345);
        install.Size = new Size(175, 42);
        install.Enabled = false;
        install.Click += async (_, _) => await InstallAgent();
        Controls.Add(install);

        status.Location = new Point(30, 400);
        status.Size = new Size(475, 28);
        status.ForeColor = Color.DarkSlateGray;
        Controls.Add(status);

        LoadPrinters();
    }

    private void AddLabel(string value, int x, int y)
    {
        Controls.Add(new Label {
            Text = value,
            Location = new Point(x, y),
            AutoSize = true
        });
    }

    private void ConfigureCombo(ComboBox combo, int y)
    {
        combo.Location = new Point(30, y);
        combo.Size = new Size(475, 32);
        combo.DropDownStyle = ComboBoxStyle.DropDownList;
        Controls.Add(combo);
    }

    private void LoadPrinters()
    {
        foreach (string printer in System.Drawing.Printing.PrinterSettings.InstalledPrinters)
        {
            kitchen.Items.Add(printer);
            cashier.Items.Add(printer);
        }

        if (kitchen.Items.Count > 0)
        {
            kitchen.SelectedIndex = 0;
            cashier.SelectedIndex = 0;
            status.Text = $"{kitchen.Items.Count} impresora(s) detectada(s).";
        }
        else
        {
            status.Text = "Windows no detecta impresoras instaladas.";
        }
    }

    private async Task ValidateToken()
    {
        authenticated = false;
        install.Enabled = false;

        if (string.IsNullOrWhiteSpace(token.Text))
        {
            status.Text = "Introduce el token del agente.";
            return;
        }

        if (kitchen.SelectedItem is null || cashier.SelectedItem is null)
        {
            status.Text = "Selecciona las impresoras.";
            return;
        }

        validate.Enabled = false;
        status.Text = "Validando conexión con Pedidos360...";

        try
        {
            using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(20) };
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token.Text.Trim());

            using var response = await client.PostAsync(
                $"{ServerUrl}/api/restaurant/printing/auth",
                new StringContent("{}", Encoding.UTF8, "application/json")
            );

            string body = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                status.Text = ReadApiError(body, (int)response.StatusCode);
                return;
            }

            using var json = JsonDocument.Parse(body);
            if (!json.RootElement.TryGetProperty("success", out var success) ||
                success.ValueKind != JsonValueKind.True)
            {
                status.Text = "El servidor no confirmó la autenticación.";
                return;
            }

            authenticated = true;
            install.Enabled = true;
            status.Text = "Conexión validada. Ya puedes instalar.";
        }
        catch (Exception ex)
        {
            status.Text = "Falló la conexión. Consulta el detalle.";
            MessageBox.Show(ex.ToString(), "Diagnóstico de conexión", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        finally
        {
            validate.Enabled = true;
        }
    }

    private static string ReadApiError(string body, int code)
    {
        try
        {
            using var json = JsonDocument.Parse(body);
            if (json.RootElement.TryGetProperty("error", out var error))
                return error.GetString() ?? $"El servidor rechazó la solicitud ({code}).";
        }
        catch { }

        return $"El servidor rechazó la solicitud ({code}).";
    }

    private async Task InstallAgent()
    {
        if (!authenticated || kitchen.SelectedItem is null || cashier.SelectedItem is null)
            return;

        string savedToken = token.Text.Trim();
        string kitchenName = kitchen.SelectedItem.ToString()!;
        string cashierName = cashier.SelectedItem.ToString()!;

        validate.Enabled = false;
        install.Enabled = false;
        status.Text = "Instalando el agente. No cierres esta ventana...";

        try
        {
            await Task.Run(() =>
            {
                Directory.CreateDirectory(InstallDir);
                Directory.CreateDirectory(ConfigDir);

                using Stream resource = Assembly.GetExecutingAssembly()
                    .GetManifestResourceStream("Pedidos360Setup.agent-bundle.zip")
                    ?? throw new InvalidOperationException("No se encontró el paquete del agente dentro del instalador.");

                string zipPath = Path.Combine(Path.GetTempPath(), "pedidos360-agent-bundle.zip");
                using (var file = File.Create(zipPath))
                    resource.CopyTo(file);

                ZipFile.ExtractToDirectory(zipPath, InstallDir, true);
                File.Delete(zipPath);

                var settings = new
                {
                    serverUrl = ServerUrl,
                    token = savedToken,
                    kitchenPrinterName = kitchenName,
                    cashierPrinterName = cashierName
                };

                string configPath = Path.Combine(ConfigDir, "agent.json");
                File.WriteAllText(configPath, JsonSerializer.Serialize(settings, new JsonSerializerOptions {
                    WriteIndented = true
                }), new UTF8Encoding(false));

                string nodeExe = Path.Combine(InstallDir, "node.exe");
                string entryPoint = Path.Combine(InstallDir, "dist", "index.js");

                if (!File.Exists(nodeExe) || !File.Exists(entryPoint))
                    throw new FileNotFoundException("El paquete del agente está incompleto.");

                Run("icacls.exe", new[] {
                    ConfigDir, "/inheritance:r",
                    "/grant:r", "*S-1-5-18:(OI)(CI)F",
                    "*S-1-5-32-544:(OI)(CI)F", "/T"
                });

                Run("schtasks.exe", new[] {
                    "/Create", "/TN", TaskName,
                    "/SC", "ONSTART",
                    "/RU", "SYSTEM",
                    "/RL", "HIGHEST",
                    "/TR", $"\"{nodeExe}\" \"{entryPoint}\"",
                    "/F"
                });

                Run("schtasks.exe", new[] { "/Run", "/TN", TaskName });
            });

            status.Text = "Instalación completada.";
            MessageBox.Show(
                "Pedidos360 quedó instalado y registrado para iniciar con Windows.\n\nEl equipo debe permanecer encendido y conectado a Internet para imprimir.",
                "Pedidos360",
                MessageBoxButtons.OK,
                MessageBoxIcon.Information
            );
            Close();
        }
        catch (Exception ex)
        {
            status.Text = "La instalación no terminó.";
            MessageBox.Show(
                ex.Message,
                "Error de instalación",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error
            );
            validate.Enabled = true;
            install.Enabled = authenticated;
        }
    }

    private static void Run(string file, IEnumerable<string> arguments)
    {
        var start = new ProcessStartInfo(file) {
            UseShellExecute = false,
            CreateNoWindow = true,
            RedirectStandardError = true,
            RedirectStandardOutput = true
        };

        foreach (string argument in arguments)
            start.ArgumentList.Add(argument);

        using var process = Process.Start(start)
            ?? throw new InvalidOperationException($"No se pudo iniciar {file}.");

        string output = process.StandardOutput.ReadToEnd();
        string error = process.StandardError.ReadToEnd();
        process.WaitForExit();

        if (process.ExitCode != 0)
            throw new InvalidOperationException(
                $"{file} falló: {error}\n{output}"
            );
    }
}
