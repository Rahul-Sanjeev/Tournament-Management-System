import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-50 border-l-4 border-red-400">
                    <h3 className="text-lg font-medium text-red-700">Something went wrong</h3>
                    <p className="mt-2 text-sm text-red-600">{this.state.error.message}</p>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;