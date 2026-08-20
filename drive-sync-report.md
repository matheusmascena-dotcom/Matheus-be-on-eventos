# Diagnóstico de sincronização do Google Drive

Importação máxima: **20 fotos por evento**. Exibição cadastrada: **20**.

| Evento | Resultado | HTTP | Arquivos encontrados | Processadas | gdown |
|---|---|---:|---:|---:|---:|
| Music On | OK | 200 | 13 | 13 | 0 |
| One Life | OK | 200 | 10 | 10 | 0 |
| The Grid | OK | 200 | 12 | 12 | 0 |
| Adriatique | OK | 200 | 18 | 18 | 0 |
| Crochestra | OK | 200 | 8 | 8 | 0 |

## Detalhes técnicos
### Music On
- URL final: `https://drive.google.com/drive/folders/12fRYhu6hrB8qkIEjTRtMX0-AnSQeyJXO?usp=sharing`
- Content-Type: `text/html; charset=utf-8`
- Resposta HTTP: `200`
- gdown exit: `0`
- Erro/saída do gdown:
```text
lickdoClayton_.jpg

  0%|          | 0.00/1.74M [00:00<?, ?B/s]
 30%|███       | 524k/1.74M [00:00<00:00, 2.69MB/s]
100%|██████████| 1.74M/1.74M [00:00<00:00, 6.64MB/s]
100%|██████████| 1.74M/1.74M [00:00<00:00, 5.86MB/s]
Downloading...
From: https://drive.google.com/uc?id=1F6wKI4ztOdKMbgNDgmvwmDrBKxWsXyqg
To: /tmp/drive_music-on-sao-paulo/FAT_1911.jpg

  0%|          | 0.00/3.12M [00:00<?, ?B/s]
 17%|█▋        | 524k/3.12M [00:00<00:00, 2.88MB/s]
 67%|██████▋   | 2.10M/3.12M [00:00<00:00, 7.96MB/s]
100%|██████████| 3.12M/3.12M [00:00<00:00, 9.41MB/s]
Downloading...
From: https://drive.google.com/uc?id=1JEdEZovqHXPgElHUx1b-gc8M-8_d_cYP
To: /tmp/drive_music-on-sao-paulo/FAT_1995.jpg

  0%|          | 0.00/2.65M [00:00<?, ?B/s]
 20%|█▉        | 524k/2.65M [00:00<00:00, 2.98MB/s]
 79%|███████▉  | 2.10M/2.65M [00:00<00:00, 8.63MB/s]
100%|██████████| 2.65M/2.65M [00:00<00:00, 8.81MB/s]
Downloading...
From: https://drive.google.com/uc?id=1J-3PRpjMslVJbCB4nNGw9fghnA2SaNOp
To: /tmp/drive_music-on-sao-paulo/FAT_2558.jpg

  0%|          | 0.00/2.28M [00:00<?, ?B/s]
 23%|██▎       | 524k/2.28M [00:00<00:00, 3.56MB/s]
100%|██████████| 2.28M/2.28M [00:00<00:00, 9.32MB/s]
Downloading...
From: https://drive.google.com/uc?id=1pIy-wH7QNmKLx_pVsZW7lfEr9OgQ1rlf
To: /tmp/drive_music-on-sao-paulo/FAT_2939.jpg

  0%|          | 0.00/1.07M [00:00<?, ?B/s]
 49%|████▉     | 524k/1.07M [00:00<00:00, 2.73MB/s]
100%|██████████| 1.07M/1.07M [00:00<00:00, 4.35MB/s]
Downloading...
From: https://drive.google.com/uc?id=1oWQ_H1MkA8LMsILbqccg-X8ElHgoPIfC
To: /tmp/drive_music-on-sao-paulo/FAT_3750.jpg

  0%|          | 0.00/2.36M [00:00<?, ?B/s]
 22%|██▏       | 524k/2.36M [00:00<00:00, 2.59MB/s]
 89%|████████▉ | 2.10M/2.36M [00:00<00:00, 7.16MB/s]
100%|██████████| 2.36M/2.36M [00:00<00:00, 6.99MB/s]
Downloading...
From: https://drive.google.com/uc?id=18OG2g59_tjORtF4zUrtSKW1W_eOU91hu
To: /tmp/drive_music-on-sao-paulo/IMG_2766.jpg

  0%|          | 0.00/1.46M [00:00<?, ?B/s]
 36%|███▌      | 524k/1.46M [00:00<00:00, 3.29MB/s]
100%|██████████| 1.46M/1.46M [00:00<00:00, 5.99MB/s]
Downloading...
From: https://drive.google.com/uc?id=1dez8XlE-Gq87dgrviB0zF8sA6Z-iJv2_
To: /tmp/drive_music-on-sao-paulo/IMG_2839.jpg

  0%|          | 0.00/1.39M [00:00<?, ?B/s]
 38%|███▊      | 524k/1.39M [00:00<00:00, 2.62MB/s]
100%|██████████| 1.39M/1.39M [00:00<00:00, 4.98MB/s]
Downloading...
From: https://drive.google.com/uc?id=1X0iZWrhjyyJFHQHLO077LcdZGcqsXZNA
To: /tmp/drive_music-on-sao-paulo/IMG_2840.jpg

  0%|          | 0.00/1.27M [00:00<?, ?B/s]
 41%|████      | 524k/1.27M [00:00<00:00, 2.65MB/s]
100%|██████████| 1.27M/1.27M [00:00<00:00, 4.73MB/s]
Downloading...
From: https://drive.google.com/uc?id=1injPG8Y9o6rcy75vVv2XKeFiw5DxaKhj
To: /tmp/drive_music-on-sao-paulo/IMG_2874.jpg

  0%|          | 0.00/2.72M [00:00<?, ?B/s]
 19%|█▉        | 524k/2.72M [00:00<00:00, 3.56MB/s]
 96%|█████████▋| 2.62M/2.72M [00:00<00:00, 11.9MB/s]
100%|██████████| 2.72M/2.72M [00:00<00:00, 10.7MB/s]
Download completed

```

### One Life
- URL final: `https://drive.google.com/drive/folders/11FUlmMiVFobyh8O_FYjaScR9AkXfqkrh?usp=sharing`
- Content-Type: `text/html; charset=utf-8`
- Resposta HTTP: `200`
- gdown exit: `0`
- Erro/saída do gdown:
```text
      | 0.00/2.77M [00:00<?, ?B/s]
 19%|█▉        | 524k/2.77M [00:00<00:00, 2.95MB/s]
 76%|███████▌  | 2.10M/2.77M [00:00<00:00, 8.60MB/s]
100%|██████████| 2.77M/2.77M [00:00<00:00, 7.55MB/s]
Downloading...
From: https://drive.google.com/uc?id=1yhTNsUHrUIgTdZ9ThPnaexitr5ywfM11
To: /tmp/drive_one-life-sao-paulo/manu bibi1-3.jpg

  0%|          | 0.00/12.3M [00:00<?, ?B/s]
  4%|▍         | 524k/12.3M [00:00<00:04, 2.90MB/s]
 17%|█▋        | 2.10M/12.3M [00:00<00:01, 8.49MB/s]
 55%|█████▌    | 6.82M/12.3M [00:00<00:00, 22.8MB/s]
100%|██████████| 12.3M/12.3M [00:00<00:00, 28.3MB/s]
Downloading...
From: https://drive.google.com/uc?id=17YaqcMt7mjNUunAkf3cwVMae8KFPS48y
To: /tmp/drive_one-life-sao-paulo/manu bibi1-31.jpg

  0%|          | 0.00/29.1M [00:00<?, ?B/s]
  2%|▏         | 524k/29.1M [00:00<00:09, 3.00MB/s]
  9%|▉         | 2.62M/29.1M [00:00<00:02, 10.1MB/s]
 23%|██▎       | 6.82M/29.1M [00:00<00:01, 11.6MB/s]
 31%|███       | 8.91M/29.1M [00:00<00:02, 9.77MB/s]
 38%|███▊      | 11.0M/29.1M [00:01<00:02, 8.30MB/s]
 45%|████▍     | 13.1M/29.1M [00:01<00:02, 7.38MB/s]
 59%|█████▉    | 17.3M/29.1M [00:01<00:01, 9.95MB/s]
 74%|███████▍  | 21.5M/29.1M [00:02<00:00, 11.5MB/s]
 85%|████████▍ | 24.6M/29.1M [00:02<00:00, 14.2MB/s]
 92%|█████████▏| 26.7M/29.1M [00:02<00:00, 12.6MB/s]
100%|██████████| 29.1M/29.1M [00:02<00:00, 11.7MB/s]
Downloading...
From: https://drive.google.com/uc?id=1p4FKhdSiFd32ZpUUacvbyZlb1U4Wol5v
To: /tmp/drive_one-life-sao-paulo/manu bibi1-5.jpg

  0%|          | 0.00/13.1M [00:00<?, ?B/s]
  4%|▍         | 524k/13.1M [00:00<00:04, 2.93MB/s]
 16%|█▌        | 2.10M/13.1M [00:00<00:01, 8.51MB/s]
 52%|█████▏    | 6.82M/13.1M [00:00<00:00, 11.6MB/s]
 84%|████████▍ | 11.0M/13.1M [00:00<00:00, 14.7MB/s]
100%|██████████| 13.1M/13.1M [00:00<00:00, 15.1MB/s]
Downloading...
From: https://drive.google.com/uc?id=11uNxdGcakMN7s4ZK3tqaGmMnrYMse7mK
To: /tmp/drive_one-life-sao-paulo/manu bibi1-6 (1).jpg

  0%|          | 0.00/9.67M [00:00<?, ?B/s]
  5%|▌         | 524k/9.67M [00:00<00:03, 2.63MB/s]
 22%|██▏       | 2.10M/9.67M [00:00<00:01, 7.42MB/s]
 65%|██████▌   | 6.29M/9.67M [00:00<00:00, 19.2MB/s]
100%|██████████| 9.67M/9.67M [00:00<00:00, 20.8MB/s]
Downloading...
From: https://drive.google.com/uc?id=1EdguvUNm5PQDnuSlEhwTsIyPgVvUjgWE
To: /tmp/drive_one-life-sao-paulo/manu bibi1-66.jpg

  0%|          | 0.00/4.72M [00:00<?, ?B/s]
 11%|█         | 524k/4.72M [00:00<00:01, 3.25MB/s]
 56%|█████▌    | 2.62M/4.72M [00:00<00:00, 10.8MB/s]
100%|██████████| 4.72M/4.72M [00:00<00:00, 14.5MB/s]
Downloading...
From: https://drive.google.com/uc?id=1G1bOyqnCwJZlrS7flql39Xn2VA3Tzoc7
To: /tmp/drive_one-life-sao-paulo/manu bibi1-9.jpg

  0%|          | 0.00/12.5M [00:00<?, ?B/s]
  4%|▍         | 524k/12.5M [00:00<00:04, 2.41MB/s]
 13%|█▎        | 1.57M/12.5M [00:00<00:01, 5.45MB/s]
 38%|███▊      | 4.72M/12.5M [00:00<00:00, 14.2MB/s]
 88%|████████▊ | 11.0M/12.5M [00:00<00:00, 22.0MB/s]
100%|██████████| 12.5M/12.5M [00:00<00:00, 19.0MB/s]
Download completed

```

### The Grid
- URL final: `https://drive.google.com/drive/folders/1HL4FvP5ABw9__7yuSHe_DZA1FwANSTEk?usp=sharing`
- Content-Type: `text/html; charset=utf-8`
- Resposta HTTP: `200`
- gdown exit: `0`
- Erro/saída do gdown:
```text
M/14.7M [00:01<00:00, 8.12MB/s]
100%|██████████| 14.7M/14.7M [00:01<00:00, 8.81MB/s]
Downloading...
From: https://drive.google.com/uc?id=17rR6MusFzF4c1zWAU3GVJjlx0Nc_OyVL
To: /tmp/drive_the-grid-outworld/339_@pedrofatore_FAT_1716 (2).jpg

  0%|          | 0.00/16.9M [00:00<?, ?B/s]
  3%|▎         | 524k/16.9M [00:00<00:06, 2.44MB/s]
 12%|█▏        | 2.10M/16.9M [00:00<00:02, 7.08MB/s]
 34%|███▍      | 5.77M/16.9M [00:00<00:00, 17.0MB/s]
 47%|████▋     | 7.86M/16.9M [00:00<00:00, 10.6MB/s]
 56%|█████▌    | 9.44M/16.9M [00:01<00:00, 8.90MB/s]
 65%|██████▌   | 11.0M/16.9M [00:01<00:00, 6.36MB/s]
 78%|███████▊  | 13.1M/16.9M [00:01<00:00, 6.08MB/s]
 90%|█████████ | 15.2M/16.9M [00:02<00:00, 6.02MB/s]
100%|██████████| 16.9M/16.9M [00:02<00:00, 7.78MB/s]
Downloading...
From: https://drive.google.com/uc?id=1pT1nW2hLrADh4wTcQ4WfowD5OscFIxAF
To: /tmp/drive_the-grid-outworld/368_@pedrofatore_FAT_1954 (2).jpg

  0%|          | 0.00/10.8M [00:00<?, ?B/s]
  5%|▍         | 524k/10.8M [00:00<00:04, 2.46MB/s]
 19%|█▉        | 2.10M/10.8M [00:00<00:01, 7.11MB/s]
 54%|█████▎    | 5.77M/10.8M [00:00<00:00, 17.0MB/s]
100%|██████████| 10.8M/10.8M [00:00<00:00, 21.2MB/s]
Downloading...
From: https://drive.google.com/uc?id=16RY36PB7NbQnoU9tN0fwMjvJKTvk5aXy
To: /tmp/drive_the-grid-outworld/48_@pedrofatore_FAT_8971.jpg

  0%|          | 0.00/14.1M [00:00<?, ?B/s]
  4%|▎         | 524k/14.1M [00:00<00:04, 2.96MB/s]
 15%|█▍        | 2.10M/14.1M [00:00<00:01, 8.59MB/s]
 33%|███▎      | 4.72M/14.1M [00:00<00:00, 14.3MB/s]
 48%|████▊     | 6.82M/14.1M [00:00<00:00, 14.4MB/s]
 63%|██████▎   | 8.91M/14.1M [00:00<00:00, 9.85MB/s]
 78%|███████▊  | 11.0M/14.1M [00:01<00:00, 11.2MB/s]
100%|██████████| 14.1M/14.1M [00:01<00:00, 13.6MB/s]
Downloading...
From: https://drive.google.com/uc?id=1aqZjWRJvFokEDGejykGuEVYgivYpRNbQ
To: /tmp/drive_the-grid-outworld/88_@pedrofatore_FAT_9325.jpg

  0%|          | 0.00/12.7M [00:00<?, ?B/s]
  4%|▍         | 524k/12.7M [00:00<00:04, 2.97MB/s]
 17%|█▋        | 2.10M/12.7M [00:00<00:01, 8.49MB/s]
 50%|████▉     | 6.29M/12.7M [00:00<00:00, 21.3MB/s]
 70%|███████   | 8.91M/12.7M [00:00<00:00, 12.6MB/s]
 87%|████████▋ | 11.0M/12.7M [00:01<00:00, 10.2MB/s]
100%|██████████| 12.7M/12.7M [00:01<00:00, 12.5MB/s]
Downloading...
From: https://drive.google.com/uc?id=1rOj1CJUSf8PwXv9Pu8MUOAjr7rA_FblU
To: /tmp/drive_the-grid-outworld/92_@pedrofatore_FAT_9339.jpg

  0%|          | 0.00/12.2M [00:00<?, ?B/s]
  4%|▍         | 524k/12.2M [00:00<00:03, 3.62MB/s]
 17%|█▋        | 2.10M/12.2M [00:00<00:01, 8.75MB/s]
 47%|████▋     | 5.77M/12.2M [00:00<00:00, 19.4MB/s]
100%|██████████| 12.2M/12.2M [00:00<00:00, 27.5MB/s]
Downloading...
From: https://drive.google.com/uc?id=1ZOk4nIwX__-lUKMfggJTH7ZiKqxhPiPp
To: /tmp/drive_the-grid-outworld/SnapInsta.to_496422313_18204657334306096_9105456404112439254_n (1).jpg

  0%|          | 0.00/179k [00:00<?, ?B/s]
100%|██████████| 179k/179k [00:00<00:00, 1.72MB/s]
100%|██████████| 179k/179k [00:00<00:00, 1.71MB/s]
Download completed

```

### Adriatique
- URL final: `https://drive.google.com/drive/folders/1ZSApcvWB5NM_SwFd_2PwgK_sU6fH4HAR?usp=sharing`
- Content-Type: `text/html; charset=utf-8`
- Resposta HTTP: `200`
- gdown exit: `0`
- Erro/saída do gdown:
```text
uNIwVH
To: /tmp/drive_adriatique-x-sao-paulo/FAT_8997.jpg

  0%|          | 0.00/2.30M [00:00<?, ?B/s]
 23%|██▎       | 524k/2.30M [00:00<00:00, 2.93MB/s]
 91%|█████████ | 2.10M/2.30M [00:00<00:00, 8.54MB/s]
100%|██████████| 2.30M/2.30M [00:00<00:00, 8.03MB/s]
Downloading...
From: https://drive.google.com/uc?id=1zKnQa-yokW0EfX5RbLqG5om6twM-XLaM
To: /tmp/drive_adriatique-x-sao-paulo/FAT_9006.jpg

  0%|          | 0.00/2.41M [00:00<?, ?B/s]
 22%|██▏       | 524k/2.41M [00:00<00:00, 2.44MB/s]
 65%|██████▌   | 1.57M/2.41M [00:00<00:00, 5.65MB/s]
100%|██████████| 2.41M/2.41M [00:00<00:00, 6.68MB/s]
Downloading...
From: https://drive.google.com/uc?id=1f4r4x3XzmnsRGrqbgq7FXxuEpQwEOO6Q
To: /tmp/drive_adriatique-x-sao-paulo/FAT_9027.jpg

  0%|          | 0.00/2.64M [00:00<?, ?B/s]
 20%|█▉        | 524k/2.64M [00:00<00:00, 3.27MB/s]
 99%|█████████▉| 2.62M/2.64M [00:00<00:00, 10.8MB/s]
100%|██████████| 2.64M/2.64M [00:00<00:00, 9.57MB/s]
Downloading...
From: https://drive.google.com/uc?id=1CoUNGLLS3elL_Rxm28vcQOJyhdrWH-6I
To: /tmp/drive_adriatique-x-sao-paulo/FAT_9153.jpg

  0%|          | 0.00/2.70M [00:00<?, ?B/s]
 19%|█▉        | 524k/2.70M [00:00<00:00, 2.47MB/s]
 58%|█████▊    | 1.57M/2.70M [00:00<00:00, 5.58MB/s]
100%|██████████| 2.70M/2.70M [00:00<00:00, 7.44MB/s]
Downloading...
From: https://drive.google.com/uc?id=15RWAo6YZtQP4hZzG0RoL5h7bc8sfs-O-
To: /tmp/drive_adriatique-x-sao-paulo/FAT_9194.jpg

  0%|          | 0.00/2.57M [00:00<?, ?B/s]
 20%|██        | 524k/2.57M [00:00<00:00, 2.65MB/s]
 82%|████████▏ | 2.10M/2.57M [00:00<00:00, 7.75MB/s]
100%|██████████| 2.57M/2.57M [00:00<00:00, 7.70MB/s]
Downloading...
From: https://drive.google.com/uc?id=1sAvWJSq2iCPg_hd0u3vg3tzZatldXHyf
To: /tmp/drive_adriatique-x-sao-paulo/FAT_9368.jpg

  0%|          | 0.00/2.43M [00:00<?, ?B/s]
 22%|██▏       | 524k/2.43M [00:00<00:00, 2.74MB/s]
 86%|████████▌ | 2.10M/2.43M [00:00<00:00, 7.95MB/s]
100%|██████████| 2.43M/2.43M [00:00<00:00, 7.58MB/s]
Downloading...
From: https://drive.google.com/uc?id=1qsUQCYEg6_wyQ-NbOFqfhrTuRxB8uYEg
To: /tmp/drive_adriatique-x-sao-paulo/FAT_9377.jpg

  0%|          | 0.00/2.36M [00:00<?, ?B/s]
 22%|██▏       | 524k/2.36M [00:00<00:00, 2.88MB/s]
 89%|████████▉ | 2.10M/2.36M [00:00<00:00, 8.36MB/s]
100%|██████████| 2.36M/2.36M [00:00<00:00, 7.74MB/s]
Downloading...
From: https://drive.google.com/uc?id=172ZBPHe6P656Ffy0VqKEgWEWHAhYTO5O
To: /tmp/drive_adriatique-x-sao-paulo/FAT_9542.jpg

  0%|          | 0.00/3.43M [00:00<?, ?B/s]
 15%|█▌        | 524k/3.43M [00:00<00:00, 3.55MB/s]
 76%|███████▋  | 2.62M/3.43M [00:00<00:00, 11.8MB/s]
100%|██████████| 3.43M/3.43M [00:00<00:00, 12.5MB/s]
Downloading...
From: https://drive.google.com/uc?id=1_QeUJEob06Uv06srIb3sHbcdDhIJFQmY
To: /tmp/drive_adriatique-x-sao-paulo/FAT_9548.jpg

  0%|          | 0.00/3.22M [00:00<?, ?B/s]
 16%|█▋        | 524k/3.22M [00:00<00:00, 3.55MB/s]
 81%|████████▏ | 2.62M/3.22M [00:00<00:00, 11.9MB/s]
100%|██████████| 3.22M/3.22M [00:00<00:00, 12.0MB/s]
Download completed

```

### Crochestra
- URL final: `https://drive.google.com/drive/folders/1GLIzv4CL_uxEsY7GlNGuYvxr1VeeqXkQ?usp=sharing`
- Content-Type: `text/html; charset=utf-8`
- Resposta HTTP: `200`
- gdown exit: `0`
- Erro/saída do gdown:
```text
older contents
Retrieving folder contents completed
Building directory structure
Building directory structure completed
Downloading...
From: https://drive.google.com/uc?id=1yT4wwp621_fFExH6H4PbZVb8gcwJXDyI
To: /tmp/drive_crochestra-brasil/09_01_26-Crochestra_0011.jpg

  0%|          | 0.00/3.76M [00:00<?, ?B/s]
 14%|█▍        | 524k/3.76M [00:00<00:01, 3.05MB/s]
 56%|█████▌    | 2.10M/3.76M [00:00<00:00, 8.78MB/s]
100%|██████████| 3.76M/3.76M [00:00<00:00, 11.6MB/s]
Downloading...
From: https://drive.google.com/uc?id=1KoYHg-7HYZZdhMBEqAWJicrqgxj9pOV8
To: /tmp/drive_crochestra-brasil/09_01_26-Crochestra_0016.jpg

  0%|          | 0.00/3.24M [00:00<?, ?B/s]
 16%|█▌        | 524k/3.24M [00:00<00:00, 2.97MB/s]
 65%|██████▍   | 2.10M/3.24M [00:00<00:00, 8.50MB/s]
100%|██████████| 3.24M/3.24M [00:00<00:00, 10.0MB/s]
Downloading...
From: https://drive.google.com/uc?id=1upI9_RGSoYzF_R4SyXdDqCVRab7KuRIB
To: /tmp/drive_crochestra-brasil/10_01_26-Crochestra_0002.jpg

  0%|          | 0.00/5.32M [00:00<?, ?B/s]
 10%|▉         | 524k/5.32M [00:00<00:01, 3.25MB/s]
 49%|████▉     | 2.62M/5.32M [00:00<00:00, 10.8MB/s]
100%|██████████| 5.32M/5.32M [00:00<00:00, 16.1MB/s]
Downloading...
From: https://drive.google.com/uc?id=11jlp1NHB42QZzNUYSj5QJsQah-wNSW5W
To: /tmp/drive_crochestra-brasil/10_01_26-Crochestra_0006 (1).jpg

  0%|          | 0.00/3.89M [00:00<?, ?B/s]
 13%|█▎        | 524k/3.89M [00:00<00:01, 3.16MB/s]
 67%|██████▋   | 2.62M/3.89M [00:00<00:00, 10.6MB/s]
100%|██████████| 3.89M/3.89M [00:00<00:00, 12.5MB/s]
Downloading...
From: https://drive.google.com/uc?id=1Cb1U2mELvpefe8gS5uCXjPTl0VveFUjr
To: /tmp/drive_crochestra-brasil/10_01_26-Crochestra_0013.jpg

  0%|          | 0.00/4.62M [00:00<?, ?B/s]
 11%|█▏        | 524k/4.62M [00:00<00:01, 3.01MB/s]
 45%|████▌     | 2.10M/4.62M [00:00<00:00, 8.65MB/s]
100%|██████████| 4.62M/4.62M [00:00<00:00, 13.2MB/s]
Downloading...
From: https://drive.google.com/uc?id=1S1Fqb5RaTds0CJ2IHz94ZTNHypC49GRO
To: /tmp/drive_crochestra-brasil/10_01_26-Crochestra_0014.jpg

  0%|          | 0.00/5.15M [00:00<?, ?B/s]
 10%|█         | 524k/5.15M [00:00<00:01, 3.46MB/s]
 51%|█████     | 2.62M/5.15M [00:00<00:00, 11.4MB/s]
100%|██████████| 5.15M/5.15M [00:00<00:00, 16.6MB/s]
Downloading...
From: https://drive.google.com/uc?id=1_xPniRDrpw7p-Bfb7vWTy2aBgYL0WkWn
To: /tmp/drive_crochestra-brasil/10_01_26-Crochestra_0024.jpg

  0%|          | 0.00/8.17M [00:00<?, ?B/s]
  6%|▋         | 524k/8.17M [00:00<00:02, 3.24MB/s]
 32%|███▏      | 2.62M/8.17M [00:00<00:00, 10.9MB/s]
 96%|█████████▌| 7.86M/8.17M [00:00<00:00, 26.8MB/s]
100%|██████████| 8.17M/8.17M [00:00<00:00, 21.6MB/s]
Downloading...
From: https://drive.google.com/uc?id=1CnuCPV6_P0RO2ZSQn1PyBKFq_4RRwVD7
To: /tmp/drive_crochestra-brasil/DSC01841-Enhanced-NR.jpg

  0%|          | 0.00/2.04M [00:00<?, ?B/s]
 26%|██▌       | 524k/2.04M [00:00<00:00, 2.71MB/s]
100%|██████████| 2.04M/2.04M [00:00<00:00, 7.72MB/s]
100%|██████████| 2.04M/2.04M [00:00<00:00, 6.76MB/s]
Download completed

```

## Interpretação
- **OK** = a pasta foi acessada e as fotos foram importadas.
- **FAILED_OR_EMPTY** = o runner chegou ao link, mas não conseguiu obter arquivos de imagem da pasta.
