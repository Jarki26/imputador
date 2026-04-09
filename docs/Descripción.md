---
tags:
  - Task
---

Herramienta de registro de tareas y asignación de registros horarios para el seguimiento de las tareas. Cada tarea tiene un proyecto asociado, un tipo de tarea, un título y una descripción. El registro de taras se compone de un día y hora en la que se comienza la tarea referenciada y su hora de finalización. Los tipos de tareas sean parametrizables y se comprondrán de una lista cerrada de valores. De esta forma se pretende completar la imputación de trabajo de una jornada laboral con el conjunto de estos registros de manera que no queden horas entre registros sin registrar (Se considera que los registros que están correctamente en secuencia tienen la hora de fin igual que la de inicio de la tarea a la que preceden). Para esto se contempla una tarea especial de descanso, para registrar aquellos lapsos de tiempo en los que se han hecho paradas para almorzar, comer u otro tipo de ausencias justificadas pero no facturables para la empresa. Debe haber también un procesamiento del computo de horas diario que se represente por semana para mostrar la referencia de horas trabajadas respecto al total de esperadas para la semana (por defecto son 41h semanales pero deberá poder ser editable por el usuario).

La representación del usuario debe permitir ver una vista global de la semana con los registros completados marcados a color y los huecos de horas que no tienen registro, similar a la vista semanal que ofrece el calendario de Outlook mostrando marcas de hora en el día. El total de horas registradas por día deberá aparecer en la parte superior de la columna que represente el día.

Al hacer click sobre la columna de uno de los días debe aparecer el desglose completo del día con el nombre de proyecto, título, tipo y duración de tiempo (hora de fin menos la de inicio) por registro. Al tocar un registro aparecen las siguientes opciones:

- Editar: Que permite cambiar las marcas de tiempo del registro de dos formas, modificando el inicio y/o fin o estableciendo la duración del registro (en formato 00h 00m 00s) en base a la hora de inicio sumándole la duración para determinar la hora de fin. Otra opción es poder cambiar la tarea asignada al registro.
- Insertar con sobreescritura: Crear un nuevo registro dentro del rango, haciendo que a parte de crear el nuevo registro de forma normal, se divida el registro original en dos haciendo que no se solapen las horas con el nuevo registro insertado. Por ejemplo: si hay una tarea A que va de 9:00 a 11:00 y se quiere crear una tarea B de 10:00 a 10:30 (o de comienzo 10:00 con una duración de 30m) el registro de tareas quedará de la siguiente forma
  - A - 9:00 - 10:00
  - B - 10:00 - 10:30
  - A - 10:30 - 11:00
- Insertar con desplazamiento: Crear un nuevo registro dentro del rango, dividiendo el original como en el caso anterior pero manteniendo la duración de la suma de ambos teniendo en cuenta que la hora inicial no se altera y haciendo que al insertar el registro nuevo no se solapen las horas y haciendo un desplazamiento de las horas de inicio y fin de todos los registros consecutivos. Por ejemplo: si hay una tarea A que va de 9:00 a 11:00 y se quiere crear una tarea B de 10:00 a 10:30 (o de comienzo 10:00 con una duración de 30m) el registro de tareas quedará de la siguiente forma
  - A - 9:00 - 10:00
  - B - 10:00 - 10:30
  - A - 10:30 - 11:30

Para la creación de registros dentro de un día habrá un botón que mostrará el formulario de creación donde aparece un desplegable de tareas recientes (10 últimas usadas que serán registradas en la base de datos y que se purgarán cuando al realizar una consulta hayan pasado más de 2 semanas desde que se haya referenciado) adicionalmente habrá un botón extra para crear una tarea nueva si no existe la que se quiere referenciar. Al crear la tarea se rellenará:

- Título: Nombre visible de la tarea
- Descripción: Si se deja vacío será igual que el título.
- Proyecto: Un componente tipo Autocomplete en el que conforme se escribe aparecen resultados sugeridos de proyectos usados. Si se escribe uno que no existe se añadirá a la base de datos de proyectos existentes.
- Tipo de tarea: Elegido de un desplegable.
  La elección de la fecha de inicio y duración o fecha fin del registro serán campos presentes en el formulario de creación de registros. Opcionalmente habrá un check para insertar un registro en modo de relleno de huecos, en donde solo dando la duración de la tarea deseada el sistema deberá crear tantos registros como pueda aprovechando los huecos disponibles sin registro en el día hasta completar la suma de duraciones que equivalen a la introducida por el usuario.

## Tecnologías

- Para almacenar los datos hacer uso del IndexDB del navegador
- Frontal en Svelte
- Backend gestionado por JS ya que no se va a mantener persistencia externa de los datos (más allá de los del navegador)

## Características Futuras

- Cargar datos desde Excel
- Guardar datos en formato Excel
- Posibilidad de sincronizar a través de p2p con merge de datos (Web escritorio y móvil)
