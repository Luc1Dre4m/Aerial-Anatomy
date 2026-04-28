# Tutorial Completo: Aerial Anatomy
## Como abrir tu app y ganar dinero con ella en Google Play Store

---

# PARTE 1: PREPARAR TU COMPUTADORA

Antes de poder ver tu app, necesitas instalar algunas herramientas. Piensa que es como armar una caja de herramientas antes de construir algo.

---

## Paso 1: Instalar Node.js (el motor de tu app)

Node.js es como el "motor" que hace que tu app funcione en la computadora.

1. Abre tu navegador (Chrome, Edge, etc.)
2. Ve a esta pagina: **https://nodejs.org**
3. Vas a ver DOS botones verdes grandes. Haz clic en el que dice **"LTS"** (es la version mas estable)
4. Se va a descargar un archivo que termina en `.msi`
5. Haz doble clic en ese archivo descargado
6. Aparece una ventana de instalacion:
   - Clic en **"Next"**
   - Clic en **"I accept"** (acepto)
   - Clic en **"Next"** (no cambies nada)
   - Clic en **"Next"** otra vez
   - Clic en **"Install"**
   - Si te pide permiso de administrador, clic en **"Si"**
   - Espera a que termine...
   - Clic en **"Finish"**

### Como verificar que se instalo bien:
1. Presiona las teclas **Windows + R** al mismo tiempo
2. Escribe **cmd** y presiona Enter
3. En la ventana negra que aparece, escribe:
```
node --version
```
4. Debe aparecer algo como `v22.x.x` (un numero)
5. Ahora escribe:
```
npm --version
```
6. Debe aparecer otro numero como `10.x.x`

Si ves esos numeros, Node.js esta instalado correctamente.

---

## Paso 2: Instalar Git (para manejar tu codigo)

Git es como un "album de fotos" para tu codigo. Guarda cada cambio que haces.

1. Ve a: **https://git-scm.com/download/win**
2. La descarga empieza automaticamente
3. Haz doble clic en el archivo descargado
4. En TODAS las ventanas solo haz clic en **"Next"** sin cambiar nada
5. Al final haz clic en **"Install"**
6. Cuando termine, clic en **"Finish"**

### Verificar:
1. Abre **cmd** otra vez (Windows + R, escribe cmd, Enter)
2. Escribe:
```
git --version
```
3. Debe decir algo como `git version 2.x.x`

---

## Paso 3: Instalar VS Code (tu editor de codigo)

VS Code es como un "cuaderno especial" donde puedes ver y editar el codigo de tu app.

1. Ve a: **https://code.visualstudio.com**
2. Clic en el boton azul grande **"Download for Windows"**
3. Haz doble clic en el archivo descargado
4. Acepta los terminos, clic en **"Next"** en todo
5. IMPORTANTE: Marca la casilla que dice **"Add to PATH"**
6. Clic en **"Install"** y luego **"Finish"**

---

## Paso 4: Instalar Expo Go en tu celular

Expo Go es la app que te permite ver tu app en tu celular mientras la desarrollas.

### En tu celular Android:
1. Abre la **Play Store** (la tiendita de apps)
2. En la barra de busqueda arriba, escribe: **Expo Go**
3. La app tiene un icono morado/azul oscuro
4. Toca **"Instalar"**
5. Espera a que se descargue

### IMPORTANTE:
Tu celular y tu computadora DEBEN estar conectados a la MISMA red WiFi. Si tu compu esta en el WiFi de la casa y tu celular en datos moviles, NO va a funcionar.

---

# PARTE 2: ABRIR TU APP POR PRIMERA VEZ

Ahora viene la parte emocionante: ver tu app funcionando.

---

## Paso 5: Abrir el proyecto en VS Code

1. Abre **VS Code** (el programa azul que instalaste)
2. Clic en **"File"** (arriba a la izquierda)
3. Clic en **"Open Folder..."**
4. Navega hasta: **Desktop > Aerial-Anatomy-Project**
5. Selecciona esa carpeta y clic en **"Select Folder"**
6. Ahora puedes ver todos los archivos de tu app a la izquierda

---

## Paso 6: Abrir la Terminal

La terminal es como una "ventana de comandos" dentro de VS Code.

1. En VS Code, ve al menu de arriba
2. Clic en **"Terminal"**
3. Clic en **"New Terminal"**
4. Aparece una ventana en la parte de abajo de VS Code
5. Ahi es donde vas a escribir los comandos

---

## Paso 7: Instalar las dependencias (las piezas de tu app)

Tu app usa muchas "piezas" creadas por otros programadores. Necesitas descargarlas.

1. En la terminal de abajo, escribe este comando y presiona **Enter**:

```
npm install
```

2. ESPERA. Esto tarda entre 1 y 5 minutos dependiendo de tu internet
3. Van a aparecer muchos textos. No te preocupes, es normal
4. Cuando termine, veras algo como:
```
added XXX packages in XXs
```
5. Si ves "vulnerabilities" no te preocupes, es normal y no afecta tu app

### Si te sale un error:
- Cierra la terminal
- Abre una nueva (Terminal > New Terminal)
- Intenta otra vez con `npm install`

---

## Paso 8: Iniciar tu app

Este es el momento magico.

1. En la terminal, escribe:

```
npx expo start
```

2. Espera unos segundos...
3. Vas a ver un **codigo QR** (un cuadrado con puntitos) en la terminal
4. Tambien aparece un menu con opciones como:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android)
›
› Press a │ open Android
› Press w │ open web
› Press r │ reload app
› Press j │ open debugger
```

---

## Paso 9: Ver la app en tu celular

1. Abre la app **Expo Go** en tu celular Android
2. Toca el boton **"Scan QR Code"**
3. Apunta la camara de tu celular al codigo QR que aparece en la terminal
4. ESPERA unos 10-30 segundos la primera vez (puede tardar)
5. De repente... TU APP APARECE EN TU CELULAR

### Que deberias ver:
- Pantalla oscura (fondo negro/azul oscuro)
- Texto dorado diciendo "Anatomia para Artes Aereas"
- 5 pestanas abajo: Cuerpo, Musculos, Movimientos, Cadenas, Estudio

### Si NO aparece:
- Verifica que tu celular y compu estan en el MISMO WiFi
- En la terminal presiona la tecla **r** para recargar
- Si sigue sin funcionar, cierra Expo Go, cierra la terminal, y vuelve a hacer `npx expo start`

---

## Paso 10: Navegar por tu app

Ahora que la app esta abierta, explora:

- **Cuerpo**: Mapa del cuerpo humano interactivo. Toca las zonas para ver musculos
- **Musculos**: Lista de 36+ musculos con nombres en espanol, ingles y latin
- **Movimientos**: 50+ movimientos de tela, trapecio, aro, cuerda y straps
- **Cadenas**: Las 5 cadenas biomecanicas (incluye la Cadena de Suspension Aerea)
- **Estudio**: Flashcards, quizzes, repeticion espaciada, quiz corporal

### Para cerrar la app:
- En la terminal de VS Code, presiona **Ctrl + C**
- Te preguntara si quieres parar, escribe **Y** y presiona Enter

### Para volver a abrir la app:
- Solo escribe `npx expo start` en la terminal otra vez

---

# PARTE 3: PREPARAR TU APP PARA GOOGLE PLAY STORE

Ahora viene lo interesante: poner tu app en la tienda para que MILES de personas la descarguen y tu puedas ganar dinero.

---

## Paso 11: Crear una cuenta de Expo (GRATIS)

Expo es el servicio que va a "construir" tu app para que funcione en telefonos reales (no solo en modo desarrollo).

1. Ve a: **https://expo.dev/signup**
2. Llena el formulario:
   - **Username**: escoge un nombre de usuario (ej: "aerialanatomyapp")
   - **Email**: tu correo electronico
   - **Password**: una contrasena segura
3. Clic en **"Create Account"**
4. Te van a enviar un email de verificacion. Abrelo y haz clic en el enlace

### Conectar tu computadora con tu cuenta:
1. En la terminal de VS Code, escribe:
```
npx expo login
```
2. Te pide tu username: escribelo y presiona Enter
3. Te pide tu password: escribelo (no se ve lo que escribes, es normal) y presiona Enter
4. Si dice "Logged in" ya estas conectado

---

## Paso 12: Instalar EAS CLI (la herramienta para construir tu app)

EAS (Expo Application Services) es como una "fabrica en la nube" que toma tu codigo y crea un archivo que los telefonos pueden instalar.

1. En la terminal escribe:
```
npm install -g eas-cli
```
2. Espera a que termine
3. Verifica que funciona:
```
eas --version
```
4. Debe mostrar un numero de version

---

## Paso 13: Configurar EAS Build

1. En la terminal escribe:
```
eas build:configure
```
2. Te va a preguntar: **"Which platforms would you like to configure?"**
   - Usa las flechas del teclado para seleccionar **"Android"**
   - Presiona Enter
3. Esto crea un archivo `eas.json` en tu proyecto

4. Ahora abre el archivo `eas.json` que se creo y reemplaza TODO su contenido con esto:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

5. Guarda el archivo (Ctrl + S)

---

## Paso 14: Configurar app.json (la identidad de tu app)

El archivo `app.json` es como la "credencial" de tu app. Le dice a Google Play como se llama, que icono tiene, etc.

1. Abre el archivo `app.json` en VS Code
2. Asegurate de que tenga esta informacion (modifica lo que necesites):

```json
{
  "expo": {
    "name": "Aerial Anatomy",
    "slug": "aerial-anatomy",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1A1A2E"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1A1A2E"
      },
      "package": "com.aerialanatomyapp.aerialanatomia",
      "versionCode": 1
    },
    "plugins": [
      "expo-font"
    ]
  }
}
```

### Sobre el "package":
- `com.aerialanatomyapp.aerialanatomia` es el ID unico de tu app
- Una vez que lo subas a Play Store, NUNCA lo puedes cambiar
- Debe ser unico en todo el mundo (nadie mas puede tener el mismo)

### Sobre el icono:
- Necesitas crear una imagen de 1024x1024 pixeles para `icon.png`
- Y otra de 1024x1024 para `adaptive-icon.png`
- Ponlas en la carpeta `assets/`
- Puedes crearlas en Canva (https://canva.com) gratis

---

## Paso 15: Crear tu primer APK de prueba

Un APK es el archivo que los telefonos Android usan para instalar apps. Vamos a crear uno para probar.

1. En la terminal escribe:
```
eas build --platform android --profile preview
```

2. Te puede preguntar:
   - **"Generate a new Android Keystore?"** — Escribe **Y** y Enter
   - El keystore es como una "firma digital" que prueba que TU hiciste esta app

3. ESPERA. Esto tarda entre 10 y 30 minutos porque se construye en los servidores de Expo
4. Vas a ver una barra de progreso y un link a la construccion
5. Cuando termine, te da un link para descargar el APK

### Instalar el APK en tu celular:
1. Descarga el APK en tu celular (abre el link que te dio EAS)
2. Android te pregunta si quieres instalar de "fuentes desconocidas" — di que **Si**
3. Instala la app
4. Abrela — ahora funciona SIN Expo Go, como una app real

---

## Paso 16: Probar TODA la app

Antes de subirla a Play Store, revisa TODA la app:

### Lista de verificacion:
- [ ] La app abre sin errores
- [ ] Puedo cambiar idioma entre Espanol e Ingles
- [ ] Los 5 tabs funcionan (Cuerpo, Musculos, Movimientos, Cadenas, Estudio)
- [ ] Puedo ver musculos y tocar para ver detalles
- [ ] Puedo ver movimientos y filtrar por disciplina y nivel
- [ ] Las flashcards funcionan (voltear tarjeta)
- [ ] El quiz funciona (seleccionar respuestas)
- [ ] El quiz corporal funciona (tocar zonas del cuerpo)
- [ ] Las cadenas biomecanicas se ven bien
- [ ] El mapa corporal responde al toque
- [ ] La nota de seguridad aparece en cada movimiento
- [ ] El credito "Rubi Lueiza Fuentes" aparece
- [ ] Los favoritos se guardan (corazon)
- [ ] Las notas del instructor se guardan
- [ ] El diario de entrenamiento funciona

---

# PARTE 4: SUBIR A GOOGLE PLAY STORE

---

## Paso 17: Crear cuenta de Google Play Developer

Esta es la unica parte que cuesta dinero: **$25 dolares**, un solo pago para TODA LA VIDA.

1. Ve a: **https://play.google.com/console**
2. Clic en **"Go to Play Console"**
3. Inicia sesion con una cuenta de Google (Gmail)
4. Clic en **"Create account"**
5. Elige **"Personal"** (para cuenta personal)

### Llenar el formulario:
- **Developer name**: "Aerial Anatomy" o tu nombre real
- **Email**: tu correo (los usuarios te pueden contactar aqui)
- **Phone**: tu numero de telefono
- **Website**: puedes dejarlo vacio por ahora

6. Acepta los terminos y condiciones
7. **Paga los $25 USD** con tarjeta de credito o debito
8. Google verifica tu identidad — esto puede tardar de **1 a 3 dias**
9. Te llega un email cuando tu cuenta esta aprobada

### MIENTRAS ESPERAS la aprobacion, puedes avanzar con los siguientes pasos.

---

## Paso 18: Crear las imagenes para Play Store

Google Play necesita imagenes especificas. Prepara TODAS antes de subir:

### Icono de la app (OBLIGATORIO):
- Tamano: **512 x 512 pixeles**
- Formato: PNG
- Sin transparencia (debe tener fondo)
- Tip: Usa Canva gratis para crearlo

### Capturas de pantalla (OBLIGATORIO, minimo 2):
- Tamano: **1080 x 1920 pixeles** (vertical)
- Necesitas **minimo 2**, recomendado **5-8**
- Toma screenshots de tu app con las mejores pantallas:
  1. Pantalla de Cuerpo con el mapa corporal
  2. Lista de musculos
  3. Detalle de un musculo (ej: Deltoides)
  4. Lista de movimientos
  5. Detalle de un movimiento con secuencia de activacion
  6. Cadenas biomecanicas
  7. Quiz/Estudio
  8. Pantalla de calentamiento

### Como tomar capturas:
- En tu celular Android: presiona **Volumen Abajo + Boton de Encendido** al mismo tiempo
- La captura se guarda en tu galeria

### Imagen destacada (Feature Graphic) (OBLIGATORIO):
- Tamano: **1024 x 500 pixeles**
- Es la imagen grande que aparece arriba en Play Store
- Debe verse profesional y mostrar de que trata tu app
- Tip: En Canva, crea una imagen con el logo, nombre y un preview de la app

---

## Paso 19: Construir la version de produccion

Ahora si vamos a crear el archivo REAL que sube a Play Store. Es diferente al APK de prueba.

1. En la terminal escribe:
```
eas build --platform android --profile production
```

2. Si te pregunta sobre el keystore, escribe **Y**
3. ESPERA 10-30 minutos
4. Al terminar, descarga el archivo **.aab** (Android App Bundle)
5. GUARDA este archivo en un lugar seguro. Lo necesitas para Play Store.

### Diferencia entre APK y AAB:
- **APK**: para instalar directo en un telefono (pruebas)
- **AAB**: para subir a Google Play Store (produccion)

---

## Paso 20: Crear tu app en Google Play Console

1. Ve a **https://play.google.com/console**
2. Clic en **"Create app"** (boton azul arriba a la derecha)
3. Llena el formulario:

| Campo | Que poner |
|-------|-----------|
| App name | **Aerial Anatomy - Anatomia Aereas** |
| Default language | **Spanish (Latin America)** |
| App or Game | **App** |
| Free or Paid | **Free** (la app es gratis, el dinero viene de suscripciones) |

4. Marca las casillas de declaraciones (que cumples las politicas)
5. Clic en **"Create app"**

---

## Paso 21: Completar la ficha de Play Store

Ahora hay que llenar TODA la informacion de tu app. Google pide MUCHO detalle.

### 21a: Dashboard — Tareas pendientes

Despues de crear la app, vas a ver una lista de tareas. Completa cada una:

### 21b: App content (Contenido de la app)

Ve a **"App content"** en el menu izquierdo y completa:

#### Privacy Policy (Politica de privacidad) — OBLIGATORIO:
- Necesitas una pagina web con tu politica de privacidad
- Solucion facil: Crea una gratis en **https://app-privacy-policy-generator.firebaseapp.com/**
- Llena los campos y te genera una pagina
- Copia el link y pegalo en Play Console

#### Ads (Publicidad):
- Selecciona **"No, my app does not contain ads"** (tu app no tiene publicidad)

#### App access (Acceso a la app):
- Selecciona **"All functionality is available without special access"** (todo esta disponible sin acceso especial)

#### Content rating (Clasificacion de contenido):
- Clic en **"Start questionnaire"**
- Categoria: **"Reference, News, or Educational"** (es una app educativa)
- Responde las preguntas:
  - Violencia: **No**
  - Contenido sexual: **No**
  - Lenguaje ofensivo: **No**
  - Drogas: **No**
- Al final te da una clasificacion como **"Everyone"** (para todos) o **"Everyone 10+"**

#### Target audience (Publico objetivo):
- Edad: **18 y mas** (es para aereealistas adultos)
- NO marques "ninos" aunque pienses en un nino de 10 como este tutorial

#### Data safety (Seguridad de datos):
- Tu app recopila datos? Si marcas que tiene cuentas/suscripciones:
  - Data collected: **Purchase history** (historial de compras)
  - Data shared: **No data shared**
  - Security: **Data is encrypted in transit**

### 21c: Store listing (Ficha de la tienda)

Ve a **"Main store listing"** y completa:

#### Titulo:
```
Aerial Anatomy - Anatomia para Artes Aereas
```

#### Descripcion corta (max 80 caracteres):
```
Anatomia aplicada a tela, trapecio, aro, cuerda y straps.
```

#### Descripcion completa:
```
La primera app movil de anatomia aplicada a artes aereas circenses.

FUNCIONES PRINCIPALES:
- Mapa corporal interactivo con 36+ musculos
- 50+ movimientos de tela, trapecio, aro/lira, cuerda, straps
- 5 cadenas biomecanicas (incluye la exclusiva Cadena de Suspension Aerea)
- Nombres en espanol, ingles y latin
- Roles musculares: agonista, sinergista, estabilizador, antagonista
- Secuencias de activacion animadas
- Sistema de estudio: flashcards, quizzes, repeticion espaciada
- Evaluador de riesgo por movimiento
- Calentamiento personalizado segun los movimientos que vas a practicar
- Diario de entrenamiento
- Notas personalizadas para instructores
- Arbol de progresiones visuales

BILINGUE COMPLETO:
Toda la app disponible en espanol e ingles. Cambia de idioma en cualquier momento.

NIVELES:
Desde fundamentals hasta elite. Contenido para principiantes y aereealistas avanzados.

DISCIPLINAS:
Tela/Silks, Trapecio Fijo, Aro/Lira, Cuerda Lisa, Straps

SEGURIDAD:
Cada movimiento incluye notas de seguridad y prevencion de lesiones.

CONTENIDO PREMIUM:
- Acceso a todos los musculos y movimientos
- Animaciones de activacion muscular
- Herramientas de estudio avanzadas
- Modo offline completo

PLAN INSTRUCTOR:
- Generador de PDF para clases
- Modo en vivo para ensenar
- Notas compartibles con alumnos

Creado con contenido de Rubi Lueiza Fuentes - Instructorado de Artes Aereas Circenses.

AVISO: Esta app es una herramienta educativa y NO reemplaza el consejo medico ni la supervision de un instructor certificado.
```

#### Imagenes:
- Sube el **icono** (512x512)
- Sube las **capturas de pantalla** (minimo 2)
- Sube la **imagen destacada** (1024x500)

---

## Paso 22: Subir el archivo AAB

1. En el menu izquierdo, ve a **"Production"** (dentro de "Release")
2. Clic en **"Create new release"**
3. Donde dice **"App bundles"**, clic en **"Upload"**
4. Selecciona el archivo **.aab** que descargaste en el Paso 19
5. Espera a que suba (puede tardar unos minutos)
6. En **"Release name"** escribe: `1.0.0`
7. En **"Release notes"** escribe:
```
Lanzamiento inicial de Aerial Anatomy.
- 36+ musculos con nomenclatura triple (ES/EN/Latin)
- 50+ movimientos de 5 disciplinas aereas
- 5 cadenas biomecanicas
- Sistema de estudio completo
- Bilingue espanol/ingles
```
8. Clic en **"Review release"**
9. Clic en **"Start rollout to Production"**

### IMPORTANTE:
Google revisa tu app antes de publicarla. Esto puede tardar de **1 a 7 dias** (generalmente 1-3 dias). Te llega un email cuando este aprobada.

---

# PARTE 5: MONETIZACION — COMO GANAR DINERO

Tu app es GRATIS de descargar, pero los usuarios pagan una suscripcion mensual o anual para acceder a todo el contenido. Asi funciona:

| Lo que ve un usuario GRATIS | Lo que ve un usuario PREMIUM |
|---|---|
| 10 musculos basicos | TODOS los 36+ musculos |
| 5 movimientos basicos | TODOS los 50+ movimientos |
| Flashcards limitadas | Todas las herramientas de estudio |
| Sin animaciones | Animaciones de activacion |
| Sin calentamiento | Calentamiento personalizado |

---

## Paso 23: Crear cuenta en RevenueCat (GRATIS)

RevenueCat es el servicio que maneja las suscripciones por ti. Es GRATIS hasta que ganes mucho dinero (los primeros $2,500/mes son gratis).

1. Ve a: **https://www.revenuecat.com**
2. Clic en **"Get started"**
3. Crea una cuenta con tu email
4. Confirma tu email

---

## Paso 24: Crear proyecto en RevenueCat

1. Una vez dentro, clic en **"Create new project"**
2. Nombre: **"Aerial Anatomy"**
3. Clic en **"Create project"**

---

## Paso 25: Conectar Google Play con RevenueCat

Para que RevenueCat pueda manejar pagos de Play Store, necesitan estar conectados.

### 25a: Crear una Service Account en Google Cloud

1. Ve a: **https://console.cloud.google.com**
2. Si no tienes proyecto, crea uno llamado "Aerial Anatomy"
3. En el menu hamburguesa (tres lineas arriba a la izquierda):
   - Clic en **"IAM & Admin"**
   - Clic en **"Service Accounts"**
4. Clic en **"+ Create Service Account"**
5. Nombre: **"revenuecat-service"**
6. Clic en **"Create and Continue"**
7. En Role, busca y selecciona **"Pub/Sub Admin"**
8. Clic en **"Continue"** y luego **"Done"**

### 25b: Crear una clave JSON

1. En la lista de Service Accounts, clic en el que acabas de crear
2. Ve a la pestana **"Keys"**
3. Clic en **"Add Key"** > **"Create new key"**
4. Selecciona **"JSON"**
5. Clic en **"Create"**
6. Se descarga un archivo `.json` — GUARDALO MUY BIEN, es secreto

### 25c: Dar permisos en Play Console

1. Ve a **https://play.google.com/console**
2. Clic en **"Settings"** (tuerca) en el menu izquierdo
3. Clic en **"API access"**
4. Busca tu service account y dale estos permisos:
   - **Financial data, orders, and cancellation survey responses**: View
   - **Manage orders and subscriptions**: Full access

### 25d: Conectar en RevenueCat

1. Vuelve a **RevenueCat Dashboard**
2. Ve a tu proyecto > **"Google Play Store"** en el menu izquierdo
3. Sube el archivo JSON que descargaste
4. Clic en **"Save"**

---

## Paso 26: Crear suscripciones en Google Play Console

Ahora creamos los productos que los usuarios van a comprar.

1. Ve a **Google Play Console** > tu app
2. En el menu izquierdo: **"Monetize"** > **"Subscriptions"**
3. Clic en **"Create subscription"**

### Suscripcion 1: Premium Mensual
| Campo | Valor |
|-------|-------|
| Product ID | `premium_monthly` |
| Name | Premium Monthly / Premium Mensual |
| Description | Access to all muscles, movements, and study tools |
| Default price | **$1.99 USD** |
| Billing period | **1 month** |
| Free trial | **7 days** |

4. Clic en **"Save"** y luego **"Activate"**

### Suscripcion 2: Premium Anual
| Campo | Valor |
|-------|-------|
| Product ID | `premium_annual` |
| Name | Premium Annual / Premium Anual |
| Description | Full year access - Save 37% |
| Default price | **$14.99 USD** |
| Billing period | **1 year** |
| Free trial | **7 days** |

5. Clic en **"Save"** y luego **"Activate"**

### (Opcional) Suscripcion 3: Instructor Mensual
| Campo | Valor |
|-------|-------|
| Product ID | `instructor_monthly` |
| Name | Instructor Monthly / Instructor Mensual |
| Description | All premium features + instructor tools |
| Default price | **$4.99 USD** |
| Billing period | **1 month** |
| Free trial | **7 days** |

### (Opcional) Suscripcion 4: Instructor Anual
| Campo | Valor |
|-------|-------|
| Product ID | `instructor_annual` |
| Name | Instructor Annual / Instructor Anual |
| Description | Full year instructor access |
| Default price | **$39.99 USD** |
| Billing period | **1 year** |
| Free trial | **7 days** |

---

## Paso 27: Configurar productos en RevenueCat

1. En **RevenueCat Dashboard**, ve a tu proyecto
2. Clic en **"Products"** en el menu izquierdo
3. Clic en **"+ New"**
4. Agrega cada producto:
   - App Store: **Google Play Store**
   - Product Identifier: `premium_monthly` (el mismo que pusiste en Play Console)
5. Repite para `premium_annual`, `instructor_monthly`, `instructor_annual`

### Crear Entitlements (derechos de acceso):
1. Ve a **"Entitlements"**
2. Crea entitlement: **"premium_access"**
   - Asocia los productos: `premium_monthly` y `premium_annual`
3. Crea entitlement: **"instructor_access"**
   - Asocia los productos: `instructor_monthly` y `instructor_annual`

### Crear Offering (paquete de oferta):
1. Ve a **"Offerings"**
2. Edita el offering **"default"**
3. Agrega 4 packages:
   - `$rc_monthly` → `premium_monthly`
   - `$rc_annual` → `premium_annual`
   - `rc_instructor_monthly_499` → `instructor_monthly`
   - `rc_instructor_annual_3999` → `instructor_annual`

---

## Paso 28: Obtener tu API Key de RevenueCat

1. En RevenueCat Dashboard, ve a tu proyecto
2. Clic en **"API Keys"** en el menu izquierdo
3. Copia la **Public API key** para Google Play
4. Se ve algo como: `goog_AbCdEfGhIjKlMnOpQrStUvWxYz`

---

## Paso 29: Poner tu API Key en la app

1. En VS Code, abre el archivo:
   **src/services/revenueCat.ts**

2. Busca esta linea (cerca de la linea 26):
```
android: 'YOUR_REVENUECAT_GOOGLE_API_KEY',
```

3. Reemplaza `YOUR_REVENUECAT_GOOGLE_API_KEY` con tu API key real:
```
android: 'goog_AbCdEfGhIjKlMnOpQrStUvWxYz',
```

4. Guarda el archivo (Ctrl + S)

---

## Paso 30: Construir y subir la version con pagos

Ahora que la API key esta configurada, construye una nueva version:

1. En `app.json`, cambia el `versionCode` de 1 a **2**:
```json
"versionCode": 2
```

2. Construye la nueva version:
```
eas build --platform android --profile production
```

3. Espera a que termine (10-30 min)
4. Descarga el nuevo archivo .aab
5. Ve a Google Play Console > Production > Create new release
6. Sube el nuevo .aab
7. Release notes:
```
Version 1.0.1
- Integrado sistema de suscripcion Premium
- Prueba gratis de 7 dias disponible
```
8. Publica la actualizacion

---

## Paso 31: Probar pagos (MUY IMPORTANTE)

Antes de lanzar, DEBES probar que los pagos funcionan. Google te deja hacer compras de prueba GRATIS.

### Agregar testers de licencia:
1. En Play Console, ve a **"Settings"** > **"License testing"**
2. Agrega tu email de Gmail como tester
3. Ahora cuando compres desde ESE email, NO se te cobra dinero real

### Probar:
1. Instala la nueva version de la app en tu celular
2. Ve a la pantalla de Paywall (toca "Premium Feature" o el banner dorado)
3. Selecciona un plan y toca "Iniciar prueba gratis"
4. Google Play muestra una ventana de pago — acepta
5. Como eres license tester, NO te cobra dinero
6. La app debe cambiar a modo premium (ves todos los musculos y movimientos)

---

# PARTE 6: DESPUES DEL LANZAMIENTO

---

## Paso 32: Monitorear tus ingresos

### En Google Play Console:
1. Ve a **"Financial reports"** en el menu izquierdo
2. Aqui ves cuanto dinero has ganado
3. Google se queda con el **15%** de tus ingresos (antes era 30%, ahora es 15% para el primer millon)
4. Tu te llevas el **85%**

### En RevenueCat:
1. Ve a **"Overview"** en tu Dashboard
2. Ves metricas en tiempo real:
   - **MRR** (Monthly Recurring Revenue): cuanto ganas al mes
   - **Active subscribers**: cuantas personas pagan
   - **Trial conversions**: cuantas pruebas gratis se convirtieron en pagos
   - **Churn rate**: cuantas personas cancelan

### Ejemplo de ganancias:
| Suscriptores | Plan | Tu ganas/mes |
|---|---|---|
| 100 personas | $1.99/mes | ~$169/mes |
| 500 personas | $1.99/mes | ~$846/mes |
| 100 personas | $14.99/ano | ~$106/mes |
| 1000 personas | Mix mensual/anual | ~$1,200-1,500/mes |

---

## Paso 33: Recibir tu dinero

### Configurar forma de pago en Google Play:
1. En Play Console > **"Settings"** > **"Payments profile"**
2. Agrega tu informacion bancaria:
   - Nombre del banco
   - Numero de cuenta
   - Tipo de cuenta
3. Google te paga el dia **15 de cada mes** por las ventas del mes anterior
4. El pago minimo es **$100 USD** (si ganas menos, se acumula)

---

## Paso 34: Actualizar tu app

Cada vez que quieras subir una nueva version:

1. Haz los cambios en el codigo
2. En `app.json` sube el `versionCode` en 1 (ej: de 2 a 3)
3. Opcionalmente cambia la `version` (ej: de "1.0.0" a "1.1.0")
4. Construye:
```
eas build --platform android --profile production
```
5. Sube a Play Console como nueva release

---

# RESUMEN RAPIDO (CHEAT SHEET)

## Para abrir la app en modo desarrollo:
```
cd Desktop/Aerial-Anatomy-Project
npm install        (solo la primera vez)
npx expo start     (cada vez que quieras abrir)
```
Luego escanea el QR con Expo Go en tu celular.

## Para crear APK de prueba:
```
eas build --platform android --profile preview
```

## Para crear version de Play Store:
```
eas build --platform android --profile production
```

## Costos totales:
| Concepto | Costo |
|----------|-------|
| Google Play Developer | $25 USD (una vez) |
| Expo/EAS (plan gratis) | $0 |
| RevenueCat (primeros $2,500/mes) | $0 |
| **TOTAL PARA EMPEZAR** | **$25 USD** |

## Links importantes:
| Servicio | URL |
|----------|-----|
| Expo Dashboard | https://expo.dev |
| Google Play Console | https://play.google.com/console |
| RevenueCat Dashboard | https://app.revenuecat.com |
| Canva (crear imagenes) | https://canva.com |
| Privacy Policy Generator | https://app-privacy-policy-generator.firebaseapp.com |

---

## Si algo sale mal:

### La app no abre:
- Verifica que hiciste `npm install`
- Cierra todo y vuelve a hacer `npx expo start`
- Revisa que tu celular y compu estan en el mismo WiFi

### EAS build falla:
- Lee el error completo (scroll arriba en la terminal)
- Verifica que `eas login` funciona
- Intenta `eas build` otra vez (a veces es un error temporal)

### Los pagos no funcionan:
- Verifica que pusiste la API key correcta en revenueCat.ts
- Verifica que los Product IDs son exactamente iguales en Play Console y RevenueCat
- Verifica que el email de prueba esta en License Testing

### Google rechazo mi app:
- Lee el email de rechazo cuidadosamente
- Los motivos mas comunes:
  - Falta politica de privacidad
  - Falta descripcion completa
  - Imagenes de mala calidad
  - Problemas de rendimiento
- Corrige el problema y vuelve a enviar

---

**Hecho con contenido de Rubi Lueiza Fuentes - Instructorado de Artes Aereas Circenses**
