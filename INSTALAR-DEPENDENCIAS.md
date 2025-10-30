# 🚀 Instalación de Dependencias

## Paso 1: Instalar SweetAlert2

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

Esto instalará SweetAlert2 (versión 11.14.5) que agregamos al package.json.

## Paso 2: Verificar Instalación

Después de instalar, verifica que sweetalert2 aparezca en node_modules:

```bash
ls node_modules | grep sweetalert2
```

## Paso 3: Iniciar el Servidor

```bash
npm run dev
```

## 🎯 ¡Listo para probar!

Ahora puedes probar las mejoras:
1. Ir a http://localhost:3000/usuarios
2. Intentar crear un usuario sin datos o con email duplicado
3. Ver los mensajes de error en SweetAlert2
4. Crear usuario válido y ver mensaje de éxito

---

**Nota:** Si ya tenías el servidor corriendo, detenlo y reinícialo después de `npm install`.
