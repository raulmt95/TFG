import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
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
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  link: {
    cursor: 'pointer',
    float: 'left',
    marginBottom: 10,
  }
}));

export default function SignUp(props) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [userExistsError, setUserExistsError] = React.useState(false);
  const [securityTextColor, setSecurityTextColor] = React.useState("error");
  const [securityLevel, setSecurityLevel] = React.useState("débil");
  const [weakPasswordError, setWeakPasswordError] = React.useState(false);

  const classes = useStyles();

  const checkSecurityLevel = (pw) => {
    let lowercaseLetters = /[a-z]/;
    let uppercaseLetters = /[A-Z]/;
    let numbers = /[0-9]/
    let symbols = /[!$%^&*-/]/;

    if (pw.length < 8 || !lowercaseLetters.test(pw) || !uppercaseLetters.test(pw)){
        setSecurityLevel("débil");
        setSecurityTextColor("error");
    } else if (pw.length < 12 || !numbers.test(pw) || !symbols.test(pw)){
        setSecurityLevel("normal");
        setSecurityTextColor("secondary");
    } else {
        setSecurityLevel("fuerte");
        setSecurityTextColor("primary");
    }
  }

  const showSecurityInfo = () => {
    alert(`Seguridad de la contraseña: \n
    - Débil: La contraseña tiene menos de 8 caracteres y no contiene al menos 1 mayúscula y 1 minúscula\n
    - Normal: La contraseña contiene al menos 8 caracteres y al menos 1 mayúscula y 1 minúscula\n
    - Fuerte: La contraseña contiene al menos 12 caracteres y al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo
    \fPara poder registrarte, la seguridad de la contraseña debe ser normal o fuerte
    `);
  }

  const handleChange = (event) => {
    switch (event.target.name){
        case "email":
            setEmail(event.target.value);
            setUserExistsError(false);
            break;
        case "password":
            setPassword(event.target.value);
            setWeakPasswordError(false);
            checkSecurityLevel(event.target.value);
            break;
        default:
    }
  }

  /**
   * Si el la contraseña no es débil y el usuario no existe, lo añade a la base de datos
   * @param {*} event Evento de submit
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    if (securityLevel === "débil"){
        setWeakPasswordError(true);
    }

    props.checkIfUserExists(email)
    .then(function(userExists){
        if (userExists){
          setUserExistsError(true);
        } else {
            if (securityLevel !== "débil"){
              props.addUser(email, password);
            }
        }
    });
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Registro
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant = "outlined"
                required
                fullWidth
                type = "email"
                id = "email"
                label = "Email"
                name = "email"
                autoComplete = "email"
                onChange = {handleChange}
                value = {email}
                error = {userExistsError}
              />
              {userExistsError ? <Typography color="error">Ya existe una cuenta con este email</Typography> : null}
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant = "outlined"
                required
                fullWidth
                name = "password"
                label = "Contraseña"
                type = "password"
                id = "password"
                autoComplete = "current-password"
                onChange = {handleChange}
                value = {password}
                error = {weakPasswordError}
              />
              {password !== "" ? <Typography color={securityTextColor}>Seguridad: {securityLevel}</Typography> : null}
              {weakPasswordError ? <Typography color="error">La contraseña debe contener al menos 8 caracteres y al menos 1 mayúscula y 1 minúscula</Typography> : null}
            </Grid>
          </Grid>
          <Button
            type = "submit"
            fullWidth
            variant = "contained"
            color = "primary"
            className = {classes.submit}
          >
            Registrarse
          </Button>
          
          <Link className={classes.link} onClick={props.changeRegisterMenu} variant="body2">
            ¿Ya tienes cuenta? Inicia sesión haciendo click aquí
          </Link>
          <Link className={classes.link} onClick={showSecurityInfo} variant="body2">
            Seguridad de la contraseña
          </Link>
        </form>
      </div>
    </Container>
  );
}