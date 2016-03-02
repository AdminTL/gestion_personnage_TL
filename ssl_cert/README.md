You can add your ssl certificate in this directory.
Example, how generate it :
```{r, engine='bash', count_lines}
openssl req -x509 -sha256 -newkey rsa:2048 -keyout ca.key -out ca.crt -days 365 -nodes -subj
```
