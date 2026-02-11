# 🚀 Configuración de Puppeteer para Railway

## ❌ Problema Original

```
Error: Failed to launch the browser process! 
spawn /root/.cache/puppeteer/chrome/linux-138.0.7204.94/chrome-linux64/chrome EAGAIN
```

**Causa:** Railway tiene recursos limitados (RAM/CPU) y Puppeteer consume mucha memoria.

---

## ✅ Soluciones Implementadas

### 1️⃣ **Argumentos Optimizados de Chrome**

Los argumentos más críticos que hemos agregado:

```javascript
'--disable-dev-shm-usage'  // ⚡ CRÍTICO: Evita usar /dev/shm (memoria compartida limitada en Docker)
'--single-process'         // ⚡ CRÍTICO: Reduce drásticamente el uso de memoria
'--no-zygote'              // Reduce procesos adicionales
```

### 2️⃣ **Gestión Adecuada de Recursos**

```javascript
try {
  // Generar PDF
} finally {
  // SIEMPRE cerrar página y browser
  if (page) await page.close().catch(() => {});
  if (browser) await browser.close().catch(() => {});
}
```

Esto evita **memory leaks** y procesos zombies.

---

## 🔧 Soluciones Adicionales (si persiste el problema)

### Opción A: Aumentar recursos en Railway

1. Ve a tu proyecto en Railway
2. Settings → Resources
3. Aumenta la RAM asignada (mínimo recomendado: **1GB**)

### Opción B: Variables de Entorno en Railway

Agrega estas variables en Railway:

```bash
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

Luego, en `package.json` agrega:

```json
{
  "dependencies": {
    "chrome-aws-lambda": "^10.1.0",
    "puppeteer-core": "^21.6.1"
  }
}
```

Y modifica el código para usar `chrome-aws-lambda`:

```javascript
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  args: chromium.args,
  defaultViewport: chromium.defaultViewport,
  executablePath: await chromium.executablePath,
  headless: chromium.headless,
});
```

### Opción C: Limitar PDFs Concurrentes

Si generas múltiples PDFs al mismo tiempo, implementa un **queue system**:

```javascript
// Instalar: npm install p-queue
import PQueue from 'p-queue';

const pdfQueue = new PQueue({ concurrency: 1 }); // Solo 1 PDF a la vez

export async function generarYSubirPdfFactura(data, userId) {
  return pdfQueue.add(() => generarPdfInterno(data, userId));
}
```

---

## 📊 Monitoreo en Railway

Para ver el uso de recursos en tiempo real:

```bash
railway logs
```

Busca líneas como:
- `Memory usage: XXX MB`
- `OOM killed` (Out of Memory)

---

## 🎯 Resultado Esperado

Con esta configuración optimizada:
- ✅ Menos uso de RAM (~300-400 MB por PDF vs ~800 MB antes)
- ✅ No más procesos zombies
- ✅ Generación de PDFs estable incluso con recursos limitados
- ✅ Funciona en Railway free tier (512 MB RAM)

---

## 🆘 Si AÚN Tienes Problemas

1. **Verifica logs completos en Railway:**
   ```bash
   railway logs --tail 100
   ```

2. **Aumenta timeout en Railway:**
   - Settings → Deploy → Build & Deploy timeout: 15 minutos

3. **Considera alternativas sin Puppeteer:**
   - **PDFKit** (genera PDFs sin browser, usa ~10 MB RAM)
   - **React-PDF** con `@react-pdf/renderer`
   - **APIs externas** como DocRaptor, PDF.co

---

## 📝 Notas Importantes

- Railway **NO** tiene acceso a `/dev/shm` por defecto (por eso usamos `--disable-dev-shm-usage`)
- El plan gratuito de Railway tiene **512 MB RAM** compartida
- Cada instancia de Chrome consume **~300-800 MB** dependiendo de la configuración
- **SIEMPRE** cierra el browser en un bloque `finally`

---

## ✅ Checklist de Verificación

- [x] Configuración optimizada de Puppeteer implementada
- [x] Bloque `try-finally` para cerrar recursos
- [ ] Variables de entorno configuradas en Railway (opcional)
- [ ] Monitoreo de RAM en Railway (opcional)
- [ ] Queue system para PDFs concurrentes (si es necesario)
