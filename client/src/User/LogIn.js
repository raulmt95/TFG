import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Container from '@material-ui/core/Container';


const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  link: {
      cursor: 'pointer',
  }
}));

export default function SignIn(props) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(false);
  const [emailError, setEmailError] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);

  const classes = useStyles();

  const handleCheckboxChange = () => {
    setRemember(!remember);
  }

  const handleChange = (event) => {
    switch (event.target.name){
        case "email":
            setEmail(event.target.value);
            setEmailError(false);
            break;
        case "password":
            setPassword(event.target.value);
            setPasswordError(false);
            break;
        default:
    }
  }

  /**
   * Comprueba si el usuario está en la base de datos. Si lo está, comprueba si la contraseña coincide.
   * Si coincide, pasa el usuario al Main para realizar el login
   * @param {*} event Evento de submit
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    props.checkIfUserExists(email)
    .then(function(user){
        if (user){
          props.checkPassword(email, password)
          .then(function(passwordCorrect){
            if (passwordCorrect){
              props.handleLogIn(remember, user);
            } else {
              setPasswordError(true);
            }
          });
        } else {
          setEmailError(true);
        }
    });
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <AccountCircle />
        </Avatar>
        <Typography component="h1" variant="h5">
          Inicio de sesión
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id = "email"
            label = "Email"
            name = "email"
            type = "email"
            autoComplete = "email"
            autoFocus
            onChange = {handleChange}
            error = {emailError}
          />
          {emailError ? <Typography color="error">No existe una cuenta con este email</Typography> : null}
          <TextField
            variant = "outlined"
            margin = "normal"
            required
            fullWidth
            name = "password"
            label = "Contraseña"
            type = "password"
            id = "password"
            autoComplete = "current-password"
            onChange = {handleChange}
            error = {passwordError}
          />
          {passwordError ? <Typography color="error">La contraseña no es correcta</Typography> : null}
          <FormControlLabel
            control = {<Checkbox value={remember} color="primary" onChange={handleCheckboxChange} />}
            label = "Mantener la sesión iniciada"
          />
          <Button
            type = "submit"
            fullWidth
            variant = "contained"
            color = "primary"
            className = {classes.submit}
          >
            Iniciar sesión
          </Button>

          <Link className={classes.link} onClick={props.changeRegisterMenu} variant="body2">
            ¿No tienes cuenta? Regístrate haciendo click aquí
          </Link>
        </form>
      </div>
    </Container>
  );
}