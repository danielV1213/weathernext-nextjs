import { Fragment } from "react";
import { IconButton, Snackbar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { NotificationProps } from "./Notification.types";

const Notification = ({
  isOpen,
  message,
  handleToClose,
}: NotificationProps) => {
  return (
    <Snackbar
      anchorOrigin={{
        horizontal: "left",
        vertical: "bottom",
      }}
      open={isOpen}
      autoHideDuration={2500}
      message={message}
      onClose={handleToClose}
      action={
        <Fragment>
          <IconButton
            size='medium'
            aria-label='close'
            color='inherit'
            onClick={handleToClose}
          >
            <CloseIcon fontSize='small' />
          </IconButton>
        </Fragment>
      }
    />
  );
};

export default Notification;
