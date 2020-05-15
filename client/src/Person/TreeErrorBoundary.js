import React, { Component } from "react";

class TreeErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
  
    componentDidCatch(error, info) {
      this.setState({ hasError: true });
      this.props.showNotification("treeBuildFailure");
    }
  
    render() {
      if (this.state.hasError) {
        return <h1>El árbol no puede ser renderizado. Por favor, comprueba las relaciones</h1>;
      } else {
        return this.props.children;
      }
    }
  }

  export default TreeErrorBoundary;