import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  query: {
      cursor: 'pointer',
      '&:hover': {
          color: 'purple',
      }
  }
}));

export default function QueryItem(props) {
  const classes = useStyles();

  const handleClick = () => {
    props.executeQuery(props.query.getType(), props.query.getFirstParameter(), props.query.getSecondParameter());
  }

  let firstParameter = "";
  let secondParameter = "";

  if (props.query.getType() === "findRelation"){
      firstParameter = props.personList.find(p => p.getID() === props.query.getFirstParameter());
      secondParameter = props.personList.find(p => p.getID() === props.query.getSecondParameter());
  } else if (props.query.getType() === "findByRelationType"){
      switch (props.query.getFirstParameter()){
            case "parent":
                firstParameter = "Padres de";
                break;
            case "child":
                firstParameter = "Hijos de";
                break;
            case "partners":
                firstParameter = "Parejas de";
                break;
            case "siblings":
                firstParameter = "Hermanos de";
                break;
            case "grandparent":
                firstParameter = "Abuelos de";
                break;
            case "grandchild":
                firstParameter = "Nietos de";
                break;
            case "uncle":
                firstParameter = "Tíos de";
                break;
            case "nephew":
                firstParameter = "Sobrinos de";
                break;
            case "cousin":
                firstParameter = "Primos de";
                break;
            case "siblingInLaw":
                firstParameter = "Cuñados de";
                break;
            case "childInLaw":
                firstParameter = "Yernos de";
                break;
            case "parentInLaw":
                firstParameter = "Suegros de";
                break;
            case "ancestor":
                firstParameter = "Ancestros de";
                break;
            case "descendant":
                firstParameter = "Descendientes de";
                break;
            default:
                break;
      }
      secondParameter = props.personList.find(p => p.getID() === props.query.getSecondParameter());
  } else if (props.query.getType() === "findByName"){
      firstParameter = props.query.getFirstParameter();
  }

  return (
    <div>
      {props.query.getType() === "findRelation" ? 
        <Typography gutterBottom onClick={handleClick} className={classes.query}>
            Relación entre {firstParameter.getFullName()} y {secondParameter.getFullName()}
        </Typography>
        : null
      }
      {props.query.getType() === "findByRelationType" ? 
        <Typography gutterBottom onClick={handleClick} className={classes.query}>
            {firstParameter} {secondParameter.getFullName()}
        </Typography>
        : null
      }
      {props.query.getType() === "findByName" ? 
        <Typography gutterBottom onClick={handleClick} className={classes.query}>
            Personas cuyo nombre incluye "{firstParameter}"
        </Typography>
        : null
      }
    </div>
  );
}