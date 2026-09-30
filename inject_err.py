import os

err = """import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error("ErrorBoundary caught an error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: 'red', color: 'white' }}>
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.info && this.state.info.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
"""

with open("src/ErrorBoundary.jsx", "w", encoding="utf-8") as f:
    f.write(err)

with open("src/main.tsx", "r", encoding="utf-8") as f:
    main_content = f.read()

if "ErrorBoundary" not in main_content:
    main_content = main_content.replace("import App from './App.tsx'", "import App from './App.tsx'\nimport ErrorBoundary from './ErrorBoundary.jsx'")
    main_content = main_content.replace("<App />", "<ErrorBoundary><App /></ErrorBoundary>")
    with open("src/main.tsx", "w", encoding="utf-8") as f:
        f.write(main_content)