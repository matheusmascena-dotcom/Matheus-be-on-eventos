# Diagnóstico de sincronização do Google Drive

Importação máxima: **20 fotos por evento**. Exibição cadastrada: **20**.

| Evento | Resultado | HTTP | Arquivos encontrados | Processadas | gdown |
|---|---|---:|---:|---:|---:|
| Music On | FAILED_OR_EMPTY | 200 | 0 | 0 | 2 |
| One Life | FAILED_OR_EMPTY | 200 | 0 | 0 | 2 |
| The Grid | FAILED_OR_EMPTY | 200 | 0 | 0 | 2 |
| Adriatique | FAILED_OR_EMPTY | 200 | 0 | 0 | 2 |
| Crochestra | FAILED_OR_EMPTY | 200 | 0 | 0 | 2 |

## Detalhes técnicos
### Music On
- URL final: `https://drive.google.com/drive/folders/12fRYhu6hrB8qkIEjTRtMX0-AnSQeyJXO?usp=sharing`
- Content-Type: `text/html; charset=utf-8`
- Resposta HTTP: `200`
- gdown exit: `2`
- Erro/saída do gdown:
```text
usage: gdown [-h] [-V] [-O OUTPUT] [-q] [--proxy PROXY] [--speed SPEED]
             [--no-cookies] [--no-check-certificate] [--continue] [--folder]
             [--json] [--format FORMAT] [--user-agent USER_AGENT]
             url_or_id
gdown: error: unrecognized arguments: --remaining-ok

```

### One Life
- URL final: `https://drive.google.com/drive/folders/11FUlmMiVFobyh8O_FYjaScR9AkXfqkrh?usp=sharing`
- Content-Type: `text/html; charset=utf-8`
- Resposta HTTP: `200`
- gdown exit: `2`
- Erro/saída do gdown:
```text
usage: gdown [-h] [-V] [-O OUTPUT] [-q] [--proxy PROXY] [--speed SPEED]
             [--no-cookies] [--no-check-certificate] [--continue] [--folder]
             [--json] [--format FORMAT] [--user-agent USER_AGENT]
             url_or_id
gdown: error: unrecognized arguments: --remaining-ok

```

### The Grid
- URL final: `https://drive.google.com/drive/folders/1HL4FvP5ABw9__7yuSHe_DZA1FwANSTEk?usp=sharing`
- Content-Type: `text/html; charset=utf-8`
- Resposta HTTP: `200`
- gdown exit: `2`
- Erro/saída do gdown:
```text
usage: gdown [-h] [-V] [-O OUTPUT] [-q] [--proxy PROXY] [--speed SPEED]
             [--no-cookies] [--no-check-certificate] [--continue] [--folder]
             [--json] [--format FORMAT] [--user-agent USER_AGENT]
             url_or_id
gdown: error: unrecognized arguments: --remaining-ok

```

### Adriatique
- URL final: `https://drive.google.com/drive/folders/1Cq11QSAfy7gTTgpri4kGjvnJrWcs9nGJ?usp=sharing`
- Content-Type: `text/html; charset=utf-8`
- Resposta HTTP: `200`
- gdown exit: `2`
- Erro/saída do gdown:
```text
usage: gdown [-h] [-V] [-O OUTPUT] [-q] [--proxy PROXY] [--speed SPEED]
             [--no-cookies] [--no-check-certificate] [--continue] [--folder]
             [--json] [--format FORMAT] [--user-agent USER_AGENT]
             url_or_id
gdown: error: unrecognized arguments: --remaining-ok

```

### Crochestra
- URL final: `https://drive.google.com/drive/folders/1QixvAOaAHKh5Vp91GyrDCWmHQG6l6jhz?usp=drive_link`
- Content-Type: `text/html; charset=utf-8`
- Resposta HTTP: `200`
- gdown exit: `2`
- Erro/saída do gdown:
```text
usage: gdown [-h] [-V] [-O OUTPUT] [-q] [--proxy PROXY] [--speed SPEED]
             [--no-cookies] [--no-check-certificate] [--continue] [--folder]
             [--json] [--format FORMAT] [--user-agent USER_AGENT]
             url_or_id
gdown: error: unrecognized arguments: --remaining-ok

```

## Interpretação
- **OK** = a pasta foi acessada e as fotos foram importadas.
- **FAILED_OR_EMPTY** = o runner chegou ao link, mas não conseguiu obter arquivos de imagem da pasta.
- Se HTTP for **200** e gdown continuar em 0, o bloqueio está no formato/listagem do Google Drive e não no GitHub Pages.
