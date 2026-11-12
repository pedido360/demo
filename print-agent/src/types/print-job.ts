export type PrintDestination = "cashier" | "kitchen";

export type PrintJobStatus =
  | "queued"
  | "processing"
  | "submitted"
  | "printed"
  | "failed"
  | "cancelled";

export interface PrintOption {
  id: string;
  name: string;
  section?: string;
}

export interface PrintExtra {
  id: string;
  name: string;
  price: number;
}

export interface NormalProductItem {
  product: {
    id: string;
    name: string;
    productType: string;
    price?: number;
  };
  variant: {
    id: string;
    label: string;
    price: number;
  } | null;
  quantity: number;
  ingredients: PrintOption[];
  extras: PrintExtra[];
  notes: string;
  unitPrice: number;
  total: number;
}

export interface DailyMenuItem {
  product: {
    id: string;
    name: string;
    productType: "daily_menu";
  };
  quantity: number;
  dailyMenu: {
    menuId: string;
    menuDate: string;
    size: {
      id: string;
      label: string;
      price: number;
      pricingMode: string;
    };
    soup: PrintOption | null;
    secos: PrintOption[];
    principle: PrintOption | null;
    protein: PrintOption | null;
    drink: PrintOption | null;
    dessert: PrintOption | null;
    quantity: number;
    notes: string;
  };
  unitPrice: number;
  total: number;
}

export type PrintOrderItem = NormalProductItem | DailyMenuItem;

export interface PrintJobPayload {
  restaurant_name?: string;
  order_number?: number | string;
  order_created_at?: string;
  order_type?: "dine_in" | "takeaway";
  waiter_name?: string;
  ticket_type: "CASHIER_CONTROL" | "KITCHEN_ORDER";
  title: string;
  warning?: string;
  items: PrintOrderItem[];
  subtotal?: number;
  total?: number;
  copy_label?: string;
  order_total?: number;
  table_label?: string;
  table_accumulated_total?: number | null;
  notes: string;
}

export interface PrintJob {
  job_id: string;
  service_order_id: string;
  destination: PrintDestination;
  payload: PrintJobPayload;
  claim_token: string;
  attempt_count: number;
  lease_expires_at: string;
}
