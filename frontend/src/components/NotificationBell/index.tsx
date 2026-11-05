import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { Notification } from '../../types';
import {
  getMyNotifications,
  markAsRead,
} from '../../services/notificationService';

const POLL_INTERVAL = 15000;

const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [dialogNotification, setDialogNotification] =
    useState<Notification | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getMyNotifications();
      setNotifications(data);
    } catch {
      // silently ignore — user may not be authenticated yet
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      const updated = await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === updated.id ? updated : n)),
      );
    } catch {
      // ignore
    }
  };

  const open = Boolean(anchorEl);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-BE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ color: '#c8aa6e' }}>
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.65rem',
              minWidth: 16,
              height: 16,
              bgcolor: '#c8124a',
            },
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              maxHeight: 450,
              bgcolor: '#0a1428',
              border: '1px solid rgba(200, 170, 110, 0.3)',
              borderRadius: 2,
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            borderBottom: '1px solid rgba(200, 170, 110, 0.2)',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ color: '#f0e6d2', fontWeight: 600 }}
          >
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Typography
              variant="caption"
              sx={{ color: '#c8124a', fontWeight: 600 }}
            >
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#a09b8c' }}>
              Aucune notification
            </Typography>
          </Box>
        ) : (
          <List
            sx={{
              p: 0,
              maxHeight: 380,
              overflowY: 'auto',
            }}
          >
            {notifications.map((notification, index) => (
              <Box key={notification.id}>
                <ListItemButton
                  onClick={() => {
                    if (notification.redirectLink) {
                      handleClose();
                      navigate(notification.redirectLink);
                    } else {
                      handleClose();
                      setDialogNotification(notification);
                      if (!notification.isRead) {
                        handleMarkAsRead(notification.id);
                      }
                    }
                  }}
                  sx={{
                    px: 2,
                    py: 1.5,
                    opacity: notification.isRead ? 0.5 : 1,
                    bgcolor: notification.isRead
                      ? 'rgba(160, 155, 140, 0.05)'
                      : 'rgba(10, 200, 185, 0.05)',
                    '&:hover': {
                      bgcolor: notification.isRead
                        ? 'rgba(160, 155, 140, 0.1)'
                        : 'rgba(10, 200, 185, 0.1)',
                    },
                  }}
                  disableRipple={notification.isRead}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          color: notification.isRead ? '#a09b8c' : '#f0e6d2',
                          fontWeight: notification.isRead ? 400 : 600,
                        }}
                      >
                        {notification.message}
                      </Typography>
                    }
                    secondary={
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mt: 0.5,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#785a28' }}>
                          {formatDate(notification.sentAt)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: '#0ac8b9', fontSize: '0.65rem' }}
                        >
                          {notification.notificationTypeName}
                        </Typography>
                      </Box>
                    }
                  />
                  {!notification.isRead && (
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      sx={{
                        minWidth: 'auto',
                        ml: 1,
                        color: '#0ac8b9',
                        '&:hover': { bgcolor: 'rgba(10, 200, 185, 0.15)' },
                      }}
                      title="Marquer comme lu"
                    >
                      <MarkEmailReadIcon fontSize="small" />
                    </Button>
                  )}
                </ListItemButton>
                {index < notifications.length - 1 && (
                  <Divider sx={{ borderColor: 'rgba(200, 170, 110, 0.1)' }} />
                )}
              </Box>
            ))}
          </List>
        )}
      </Popover>

      <Dialog
        open={!!dialogNotification}
        onClose={() => setDialogNotification(null)}
        PaperProps={{
          sx: {
            bgcolor: '#0a1428',
            border: '1px solid rgba(200, 170, 110, 0.3)',
            borderRadius: 2,
            minWidth: 340,
          },
        }}
      >
        <DialogTitle sx={{ color: '#c8aa6e', fontWeight: 600 }}>
          {dialogNotification?.notificationTypeName}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#f0e6d2' }}>
            {dialogNotification?.message}
          </Typography>
          {dialogNotification && (
            <Typography
              variant="caption"
              sx={{ color: '#785a28', mt: 1, display: 'block' }}
            >
              {formatDate(dialogNotification.sentAt)}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogNotification(null)}
            sx={{ color: '#0ac8b9' }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NotificationBell;
