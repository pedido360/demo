using System.Diagnostics;
using System.Drawing;
using System.IO.Compression;
using System.Net.Http.Headers;
using System.Reflection;
using System.Security;
using System.Text;
using System.Text.Json;
using System.Windows.Forms;

namespace Pedidos360Setup;

internal static class Program
{
    [STAThread]
    private static void Main()
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
                MessageBoxIcon.Warning);
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
    private const string ConfigDir = @"C:\ProgramData\Pedidos360Agent";
    private const string SystemSid = "*S-1-5-18";
    private const string AdministratorsSid = "*S-1-5-32-544";
    private static readonly TimeSpan ConnectionTimeout = TimeSpan.FromSeconds(120);

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

        Controls.Add(new Label
        {
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
        Controls.Add(new Label
        {
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

    private static bool TryNormalizeAgentToken(string raw, out string normalized)
    {
        string value = raw.Trim();

        if (value.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            value = value.Substring(7).Trim();

        var compact = new StringBuilder(value.Length);
        foreach (char c in value)
        {
            if (!char.IsWhiteSpace(c))
                compact.Append(c);
        }

        normalized = compact.ToString();

        if (normalized.Length != 64)
            return false;

        foreach (char c in normalized)
        {
            bool hex = (c >= '0' && c <= '9') ||
                       (c >= 'a' && c <= 'f') ||
                       (c >= 'A' && c <= 'F');
            if (!hex)
                return false;
        }

        return true;
    }

    private async Task ValidateToken()
    {
        authenticated = false;
        install.Enabled = false;

        if (!TryNormalizeAgentToken(token.Text, out string normalizedToken))
        {
            status.Text = "El token debe contener 64 caracteres hexadecimales. Revisa que hayas pegado la credencial completa.";
            return;
        }

        token.Text = normalizedToken;

        if (kitchen.SelectedItem is null || cashier.SelectedItem is null)
        {
            status.Text = "Selecciona las impresoras.";
            return;
        }

        validate.Enabled = false;
        status.Text = "Validando conexión con Pedidos360...";

        try
        {
            using var handler = new HttpClientHandler { UseProxy = false };
            using var client = new HttpClient(handler) { Timeout = TimeSpan.FromSeconds(60) };
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", normalizedToken);

            using var response = await client.PostAsync(
                $"{ServerUrl}/api/restaurant/printing/auth",
                new StringContent("{}", Encoding.UTF8, "application/json"));

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
            MessageBox.Show(
                ex.ToString(),
                "Diagnóstico de conexión",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
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
        catch
        {
        }

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
        status.Text = "Preparando la instalación. No cierres esta ventana...";

        try
        {
            InstallResult result = await Task.Run(() =>
                InstallAgentCore(savedToken, kitchenName, cashierName));

            if (result.Connected)
            {
                status.Text = "Agente instalado y conectado correctamente.";
                MessageBox.Show(
                    "Pedidos360 quedó instalado, conectado y configurado para iniciar con Windows.\n\nEl equipo debe permanecer encendido y conectado a Internet para imprimir.",
                    "Pedidos360",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information);
            }
            else
            {
                status.Text = "Instalación realizada; conexión pendiente.";
                MessageBox.Show(
                    "El agente quedó instalado y configurado para iniciar con Windows, pero todavía no confirmó la conexión con Pedidos360.\n\nSeguirá intentando conectarse automáticamente. Comprueba la conexión a Internet y que las impresoras estén encendidas.\n\nRegistro de diagnóstico:\n" + result.LogPath,
                    "Pedidos360: conexión pendiente",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning);
            }

            Close();
        }
        catch (Exception ex)
        {
            status.Text = "La instalación no terminó.";
            MessageBox.Show(
                ex.ToString(),
                "Error de instalación",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
            validate.Enabled = true;
            install.Enabled = authenticated;
        }
    }

    private static InstallResult InstallAgentCore(
        string savedToken,
        string kitchenName,
        string cashierName)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(InstallDir)!);
        Directory.CreateDirectory(ConfigDir);

        ConfigureSecureConfigDirectory();

        string logsDir = Path.Combine(ConfigDir, "logs");
        Directory.CreateDirectory(logsDir);

        string configPath = Path.Combine(ConfigDir, "agent.json");
        WriteConfigurationAtomically(configPath, savedToken, kitchenName, cashierName);

        string id = Guid.NewGuid().ToString("N");
        string zipPath = Path.Combine(Path.GetTempPath(), $"pedidos360-agent-{id}.zip");
        string stagingDir = InstallDir + ".staging-" + id;
        string previousDir = InstallDir + ".previous-" + id;
        string logPath = Path.Combine(logsDir, "agent.log");
        bool previousMoved = false;
        bool newInstallMoved = false;

        try
        {
            ExtractAndValidateBundle(zipPath, stagingDir);

            StopPreviousAgent();

            if (Directory.Exists(InstallDir))
            {
                Directory.Move(InstallDir, previousDir);
                previousMoved = true;
            }

            try
            {
                Directory.Move(stagingDir, InstallDir);
                newInstallMoved = true;
            }
            catch
            {
                if (previousMoved && !Directory.Exists(InstallDir))
                    Directory.Move(previousDir, InstallDir);
                throw;
            }

            string runnerPath = Path.Combine(InstallDir, "run-agent.cmd");
            WriteAgentRunner(runnerPath, logPath);

            File.WriteAllText(
                logPath,
                $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] Instalador: iniciando agente.{Environment.NewLine}",
                new UTF8Encoding(false));

            RegisterStartupTask(runnerPath);

            Run("schtasks.exe", new[] { "/Run", "/TN", TaskName });

            bool connected = WaitForAgentConnection(logPath, ConnectionTimeout);

            if (connected && previousMoved && Directory.Exists(previousDir))
                Directory.Delete(previousDir, true);

            return new InstallResult(connected, logPath);
        }
        catch
        {
            // Si la nueva carpeta no llegó a ocupar el destino, restaurar la anterior.
            if (previousMoved && !newInstallMoved &&
                !Directory.Exists(InstallDir) && Directory.Exists(previousDir))
            {
                Directory.Move(previousDir, InstallDir);
            }

            throw;
        }
        finally
        {
            if (File.Exists(zipPath))
                File.Delete(zipPath);

            if (Directory.Exists(stagingDir))
                Directory.Delete(stagingDir, true);
        }
    }

    private static void ConfigureSecureConfigDirectory()
    {
        Run("icacls.exe", new[]
        {
            ConfigDir, "/inheritance:r"
        });

        Run("icacls.exe", new[]
        {
            ConfigDir, "/grant:r",
            $"{SystemSid}:(OI)(CI)F",
            $"{AdministratorsSid}:(OI)(CI)F"
        });

        string probePath = Path.Combine(ConfigDir, ".pedidos360-write-test");
        try
        {
            File.WriteAllText(probePath, "Pedidos360 OK", new UTF8Encoding(false));
            if (File.ReadAllText(probePath) != "Pedidos360 OK")
                throw new IOException("Falló la comprobación de escritura de la configuración.");
        }
        finally
        {
            if (File.Exists(probePath))
                File.Delete(probePath);
        }
    }

    private static void WriteConfigurationAtomically(
        string configPath,
        string savedToken,
        string kitchenName,
        string cashierName)
    {
        var settings = new
        {
            serverUrl = ServerUrl,
            token = savedToken,
            kitchenPrinterName = kitchenName,
            cashierPrinterName = cashierName
        };

        string tempPath = configPath + ".tmp";

        try
        {
            File.WriteAllText(
                tempPath,
                JsonSerializer.Serialize(settings, new JsonSerializerOptions
                {
                    WriteIndented = true
                }),
                new UTF8Encoding(false));

            using (JsonDocument.Parse(File.ReadAllText(tempPath)))
            {
            }

            File.Move(tempPath, configPath, true);

            using (JsonDocument.Parse(File.ReadAllText(configPath)))
            {
            }
        }
        finally
        {
            if (File.Exists(tempPath))
                File.Delete(tempPath);
        }
    }

    private static void ExtractAndValidateBundle(string zipPath, string stagingDir)
    {
        using Stream resource = Assembly.GetExecutingAssembly()
            .GetManifestResourceStream("Pedidos360Setup.agent-bundle.zip")
            ?? throw new InvalidOperationException(
                "El instalador no contiene el paquete del agente.");

        using (var file = File.Create(zipPath))
            resource.CopyTo(file);

        Directory.CreateDirectory(stagingDir);
        ZipFile.ExtractToDirectory(zipPath, stagingDir, true);

        string nodeExe = Path.Combine(stagingDir, "node.exe");
        string entryPoint = Path.Combine(stagingDir, "dist", "index.js");
        string packageJson = Path.Combine(stagingDir, "package.json");
        string nodeModules = Path.Combine(stagingDir, "node_modules");

        if (!File.Exists(nodeExe) ||
            !File.Exists(entryPoint) ||
            !File.Exists(packageJson) ||
            !Directory.Exists(nodeModules))
        {
            throw new InvalidOperationException(
                "El paquete del agente está incompleto. No se modificó la instalación anterior.");
        }
    }

    private static void StopPreviousAgent()
    {
        string installPath = PsQuote(InstallDir);
        string taskName = PsQuote(TaskName);

        string script = $@"
$ErrorActionPreference = 'Stop'
$task = Get-ScheduledTask -TaskName '{taskName}' -ErrorAction SilentlyContinue
if ($null -ne $task -and $task.State -eq 'Running') {{
    Stop-ScheduledTask -InputObject $task -ErrorAction Stop
}}
$deadline = (Get-Date).AddSeconds(25)
do {{
    $processes = @(Get-CimInstance Win32_Process -Filter ""Name = 'node.exe'"" |
        Where-Object {{ $_.CommandLine -and $_.CommandLine.Contains('{installPath}') }})
    if ($processes.Count -eq 0) {{ break }}
    foreach ($process in $processes) {{
        Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
    }}
    Start-Sleep -Milliseconds 500
}} while ((Get-Date) -lt $deadline)
$remaining = @(Get-CimInstance Win32_Process -Filter ""Name = 'node.exe'"" |
    Where-Object {{ $_.CommandLine -and $_.CommandLine.Contains('{installPath}') }})
if ($remaining.Count -gt 0) {{
    throw 'No se pudo detener el agente anterior antes de actualizarlo.'
}}";

        Run("powershell.exe", new[]
        {
            "-NoProfile",
            "-NonInteractive",
            "-ExecutionPolicy", "Bypass",
            "-Command", script
        });
    }

    private static void WriteAgentRunner(string runnerPath, string logPath)
    {
        string content =
            "@echo off\r\n" +
            "setlocal\r\n" +
            $"cd /d \"{InstallDir}\"\r\n" +
            $"\"{Path.Combine(InstallDir, "node.exe")}\" \"{Path.Combine(InstallDir, "dist", "index.js")}\" >> \"{logPath}\" 2>&1\r\n" +
            "exit /b %ERRORLEVEL%\r\n";

        File.WriteAllText(runnerPath, content, new UTF8Encoding(false));
    }

    private static void RegisterStartupTask(string runnerPath)
    {
        string taskXmlPath = Path.Combine(
            Path.GetTempPath(),
            $"pedidos360-task-{Guid.NewGuid():N}.xml");

        string escapedInstallDir = SecurityElement.Escape(InstallDir)!;
        string escapedRunnerPath = SecurityElement.Escape(runnerPath)!;
        string escapedCommand = SecurityElement.Escape(@"C:\Windows\System32\cmd.exe")!;
        string arguments = $"/d /c \"\"{escapedRunnerPath}\"\"";

        string xml = $@"<?xml version=""1.0"" encoding=""UTF-16""?>
<Task version=""1.4"" xmlns=""http://schemas.microsoft.com/windows/2004/02/mit/task"">
  <RegistrationInfo>
    <Description>Agente de impresión de Pedidos360.</Description>
  </RegistrationInfo>
  <Triggers>
    <BootTrigger>
      <Enabled>true</Enabled>
      <Delay>PT20S</Delay>
    </BootTrigger>
  </Triggers>
  <Principals>
    <Principal id=""Author"">
      <UserId>S-1-5-18</UserId>
      <LogonType>ServiceAccount</LogonType>
      <RunLevel>HighestAvailable</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RestartOnFailure>
      <Interval>PT1M</Interval>
      <Count>999</Count>
    </RestartOnFailure>
    <ExecutionTimeLimit>PT0S</ExecutionTimeLimit>
    <Enabled>true</Enabled>
    <Hidden>false</Hidden>
    <WakeToRun>false</WakeToRun>
    <Priority>7</Priority>
  </Settings>
  <Actions Context=""Author"">
    <Exec>
      <Command>{escapedCommand}</Command>
      <Arguments>{SecurityElement.Escape(arguments)}</Arguments>
      <WorkingDirectory>{escapedInstallDir}</WorkingDirectory>
    </Exec>
  </Actions>
</Task>";

        try
        {
            File.WriteAllText(taskXmlPath, xml, Encoding.Unicode);
            Run("schtasks.exe", new[]
            {
                "/Create", "/TN", TaskName,
                "/XML", taskXmlPath,
                "/F"
            });
        }
        finally
        {
            if (File.Exists(taskXmlPath))
                File.Delete(taskXmlPath);
        }
    }

    private static bool WaitForAgentConnection(string logPath, TimeSpan timeout)
    {
        DateTime deadline = DateTime.UtcNow + timeout;

        while (DateTime.UtcNow < deadline)
        {
            if (File.Exists(logPath))
            {
                string content = File.ReadAllText(logPath);
                if (content.Contains("Agente conectado:", StringComparison.Ordinal))
                    return true;
            }

            System.Threading.Thread.Sleep(TimeSpan.FromSeconds(2));
        }

        return false;
    }

    private static string PsQuote(string value) =>
        value.Replace("'", "''", StringComparison.Ordinal);

    private static void Run(string file, IEnumerable<string> arguments)
    {
        var start = new ProcessStartInfo(file)
        {
            UseShellExecute = false,
            CreateNoWindow = true,
            RedirectStandardError = true,
            RedirectStandardOutput = true
        };

        foreach (string argument in arguments)
            start.ArgumentList.Add(argument);

        using var process = Process.Start(start)
            ?? throw new InvalidOperationException($"No se pudo iniciar {file}.");

        Task<string> outputTask = process.StandardOutput.ReadToEndAsync();
        Task<string> errorTask = process.StandardError.ReadToEndAsync();

        process.WaitForExit();
        Task.WaitAll(outputTask, errorTask);

        string output = outputTask.Result;
        string error = errorTask.Result;

        if (process.ExitCode != 0)
        {
            throw new InvalidOperationException(
                $"{file} falló (código {process.ExitCode}):\n{error}\n{output}");
        }
    }

    private sealed record InstallResult(bool Connected, string LogPath);
}
