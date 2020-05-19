# TFG
Árbol genealógico con información multimedia asociada

## Instrucciones para instalación en Ubuntu

### Paso 1 - Clonar el proyecto
Creamos un nuevo directorio, abrimos una terminal en él y ejecutamos el comando:
```
git clone https://github.com/raulmt95/TFG.git
```

### Paso 2 - Preparar el servidor
Este proyecto utiliza el entorno Node.js a modo de servidor, junto con su sistema gestor de paquetes npm.
Será necesario instalar ambos mediante los siguientes comandos:
```
sudo apt-get install nodejs
sudo apt-get install npm
```
A continuación, nos trasladamos al directorio **api** de la carpeta del proyecto e inicializamos el servidor con el comando:
```
npm start
```
Dependiendo de la versión de Node.js instalada es posible encontrar el error:
```
sh: 1: node: not found
```
Para solucionarlo, creamos un enlace simbólico llamado node que apunte hacia Node.js:
```
sudo ln -s /usr/bin/nodejs /usr/bin/node
```
Otro posible error es:
```
SyntaxError: Block-scoped declarations (let, const, function, class) not yet supported outside strict mode
```
Lo solucionamos actualizando a una versión más reciente de Node.js:
```
sudo npm install -g n
sudo n stable
```
Si todo es correcto, el servidor estará sobre el puerto 9000, y la terminal mostrará lo siguiente:
```
> api@0.0.0 start /Users/Raul/Desktop/Proyecto/api
> node ./bin/www
```

### Paso 3 - Preparar el cliente
Primero, abrimos una nueva terminal en el directorio **client** de la carpeta del servidor. 
Este proyecto utiliza la biblioteca de javascript **React** para el cliente, por lo que debemos instalarla:
```
sudo npm install react
```
Una vez instalada, lanzamos la aplicación de la misma forma que el servidor:
```
sudo npm start
```
Cuando el proceso de compilación termine, se abrirá una pestaña del navegador con la apliación.
En caso de no abrirse, podemos acceder manualmente a través de la dirección `localhost:3000` 
La terminal mostrará el siguiente mensaje:
```
Compiled successfully!

You can now view client in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.31.54:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

### Paso 4 - Preparar la base de datos
La base de datos utilizada en este proyecto es **ArangoDB Community Edition**.
Las instrucciones de instalación se encuentran en su página web, pero por comodidad se incluyen en esta guía.
Primero añadiremos la clave del repositorio:
```
curl -OL https://download.arangodb.com/arangodb36/DEBIAN/Release.key
sudo apt-key add - < Release.key
```
Segundo, lo instalamos con `apt-get`
```
echo 'deb https://download.arangodb.com/arangodb36/DEBIAN/ /' 
| sudo tee /etc/apt/sources.list.d/arangodb.list
sudo apt-get install apt-transport-https
sudo apt-get update
sudo apt-get install arangodb3=3.6.3.1-1
```
Durante la instalación, nos pedirá introducir una contraseña para el usuario root.
Dado que se trata de un servidor local, podemos dejarla en blanco, pero si se desea cambiar,
será necesario también cambiar la línea 9 del archivo **ConfigServices.js** del proyecto para incluir la contraseña,
y relanzar el servidor.
```
db.useBasicAuth("root", "contraseña");
```
El resto de opciones de personalización que aparecen las dejaremos en su valor por defecto.

Tercero, ponemos la base de datos en marcha con el comando:
```
arangodb
```
Se puede acceder a la interfaz de usuario de ArangoDB a través de la dirección `localhost:8529`.

Para terminar, refrescaremos la ventana del navegador en la que se encuentra la aplicación para que vuelva a conectar con el servidor.
Si se ha inicializado correctamente, veremos un mensaje de éxito en la parte inferior de la pantalla.

### Sobre la exportación e importación
Esta aplicación dispone de funcionalidad para exportar e importar la información almacenada. Esta se divide en dos partes: exportación e importación de datos y de archivos.

Para la **exportación de datos**, usamos la herramienta **arangodump** de ArangoDB desde la terminal:
```
arangodump --server.database "ProyectoDB" --output-directory "dump"
```
Esto creará una carpeta llamada *dump* en el directorio actual con toda la información almacenada en la base de datos *ProyectoDB*

Para la **importación de datos**, usamos la herramienta **arangorestore** de la siguiente forma:
```
arangorestore --server.database "ProyectoDB" --input-directory "dump"
```
Esto tomará la información del directorio *dump* y la introducirá en la base de datos de nombre *ProyectoDB*

La **exportación e importación de archivos** la haremos a través de la propia aplicación. En el menú de administrador, encontraremos los botones correspondientes en la parte superior de la pantalla. La exportación comenzará una descarga de una carpeta comprimida en formato .zip con los archivos almacenados en el servidor. La importación requerirá una carpeta comprimida con este mismo formato.

### Notas
- La aplicación contiene por defecto un usuario administrador, cuyo email es **admin@admin.com** y su contraseña es **adminPassword**
- En caso de ocurrir un error, se mostrará por pantalla, ya que se trata de un entorno de desarrollo. Estos mensajes no bloquean el funcionamiento de la aplicación, y se pueden cerrar haciendo click en la cruz que aparecerá en la parte superior derecha.
- No se debe confundir la importación de archivos con la subida de archivos. Para que los archivos importados puedan visualizarse, su información debe encontrarse ya almacenada en la base de datos.
