export interface Section {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Operator {
  id: string;
  name: string;
  section_id: string;
  pin: string;
  is_active: boolean;
  created_at: string;
}

export interface WorkOrder {
  id: string;
  job_number: string;
  product_name: string;
  product_type: string;
  quantity_required: number;
  status: "open" | "in_progress" | "completed";
  created_at: string;
}

export interface JobLog {
  id: string;
  operator_id: string;
  work_order_id: string;
  section_id: string;
  start_time: string;
  end_time: string | null;
  status: "active" | "completed";
  parts_completed: number;
  created_at: string;
}

export interface Task {
  id: string;
  section_id: string;
  title: string;
  frequency: "daily" | "per_job";
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface TaskCompletion {
  id: string;
  task_id: string;
  operator_id: string;
  job_log_id: string | null;
  completed_at: string;
}

export interface OperatorSession {
  id: string;
  name: string;
  sectionId: string;
}
