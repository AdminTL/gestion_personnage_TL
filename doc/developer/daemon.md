Daemon
======

The daemon usually start when the server boot or restart when a crash occur.

Systemctl
---------
Copy the file ./script/gestion_personnage.service to /etc/systemd/system/

You can rename it.

Update the file and add parameters you need after "ExecStart".

### Enable the daemon
You need to reload Systemctl when you update the file
```
systemctl daemon-reload
```

Enable the daemon
```
systemctl enable gestion_personnage.service
```

Start the daemon
```
systemctl start gestion_personnage.service
```

### View Status/Logs
Check the status
```
systemctl status gestion_personnage.service
```

Show log at tail in continuous
```
journalctl -feu gestion_personnage.service
```