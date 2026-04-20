/* eslint-disable no-unused-vars */
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Something went wrong.</h1>
          <p className="text-lg text-gray-700 mb-2">An error occurred while loading this page.</p>
          <pre className="bg-red-100 text-red-800 p-4 rounded-lg max-w-xl overflow-x-auto text-sm">
            {String(this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;