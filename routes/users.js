const bcrypt = require('bcrypt');

const {
  requireAuth,
  requireAdmin,
} = require('../middleware/auth');

const {
  getUsers,
} = require('../controller/users');
const { connect } = require('../connect');

const initAdminUser = async (app, next) => {
  const { adminEmail, adminPassword } = app.get('config');
  if (!adminEmail || !adminPassword) {
    return next();
  }

  const adminUser = {
    email: adminEmail,
    password: bcrypt.hashSync(adminPassword, 10),
    roles: 'admin',
  };

  // TODO: Create admin user
  // First, check if adminUser already exists in the database
  // If it doesn't exist, it needs to be saved
  try {
    const db = connect();
    const userCollection = db.collection('users');
    // Lets verificate if exists a user with admin role
    const existingAdmin = await userCollection.findOne({ roles: 'admin' });
    // Now if it does not exists, we are saving it
    if (!existingAdmin) {
      await userCollection.insertOne(adminUser);
    } return next();
  } catch (error) {
    // Lets handle any errors that might occur during database operations
    console.error(error);
    return next(500);
  }
};

/*
 * Español:
 *
 * Diagrama de flujo de una aplicación y petición en node - express :
 *
 * request  -> middleware1 -> middleware2 -> route
 *                                             |
 * response <- middleware4 <- middleware3   <---
 *
 * la gracia es que la petición va pasando por cada una de las funciones
 * intermedias o "middlewares" hasta llegar a la función de la ruta, luego esa
 * función genera la respuesta y esta pasa nuevamente por otras funciones
 * intermedias hasta responder finalmente a la usuaria.
 *
 * Un ejemplo de middleware podría ser una función que verifique que una usuaria
 * está realmente registrado en la aplicación y que tiene permisos para usar la
 * ruta. O también un middleware de traducción, que cambie la respuesta
 * dependiendo del idioma de la usuaria.
 *
 * Es por lo anterior que siempre veremos los argumentos request, response y
 * next en nuestros middlewares y rutas. Cada una de estas funciones tendrá
 * la oportunidad de acceder a la consulta (request) y hacerse cargo de enviar
 * una respuesta (rompiendo la cadena), o delegar la consulta a la siguiente
 * función en la cadena (invocando next). De esta forma, la petición (request)
 * va pasando a través de las funciones, así como también la respuesta
 * (response).
 */

module.exports = (app, next) => {
  app.get('/users', requireAdmin, getUsers);

  app.get('/users/:uid', requireAuth, (req, resp) => {
  });

  app.post('/users', requireAdmin, async (req, resp, next) => {
    try {
      const { email, password, roles } = req.body; // its the body on postman
      // lets validate the info is ok
      if (!email || !password || !roles) {
        console.log('Missing required fields');
        return resp.status(400).json({ error: 'Missing required fields' });
      }
      // if the info is ok, we want to save it
      const db = connect();
      const userCollection = db.collection('users');
      // first we need to validate that the user does not exist in db
      const existingUser = await userCollection.findOne({ email });
      if (existingUser) {
        console.log('User with this email already exists');
        return resp.status(403).json({ error: 'User with this email already exists' });
      }
      // if it does not exist lets save it
      const newUser = {
        email,
        password: bcrypt.hashSync(password, 10),
        roles,
      };
      // now lets create it
      await userCollection.insertOne(newUser);
      console.log('User created successfully!');
      resp.status(200).json({ message: 'User created successfully' });
    } catch (error) {
      console.error(error);
      // Handle any errors that might occur during the process
      return next(500);
    }
  });

  app.put('/users/:uid', requireAuth, (req, resp, next) => {
  });

  app.delete('/users/:uid', requireAuth, (req, resp, next) => {
  });

  initAdminUser(app, next);
};
