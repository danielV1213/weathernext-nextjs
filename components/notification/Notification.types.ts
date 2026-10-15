import type { SyntheticEvent } from "react";

export interface NotificationProps {
  isOpen: boolean;
  message: string;
  handleToClose: (
    event?: SyntheticEvent | Event | null,
    reason?: string,
  ) => void;
}
