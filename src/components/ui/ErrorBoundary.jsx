import { Component } from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected rendering error occurred.',
    };
  }

  componentDidCatch(error, info) {
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, info);
    }
  }

  handleReset() {
    this.setState({ hasError: false, errorMessage: '' });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.compact) {
      return (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-white p-5 space-y-3"
        >
          <div className="flex items-start gap-2.5 text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-bold text-[#172554]">
                {this.props.fallbackTitle || 'Section temporarily unavailable'}
              </p>
              <p className="text-xs text-[#64748B] break-words">
                {this.state.errorMessage}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-300 bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#172554] hover:bg-slate-100 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Retry section</span>
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-12 text-[#172554]">
        <div
          role="alert"
          className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-6 sm:p-8 space-y-4 shadow-sm"
        >
          <div className="flex items-center gap-2.5 text-red-700">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wide">
              Application Recovery
            </span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#172554]">
            Something went wrong displaying this view
          </h1>
          <p className="text-sm text-[#64748B] leading-relaxed">
            {this.state.errorMessage}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Retry view</span>
            </button>
            <a
              href="/"
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-[#172554] hover:bg-slate-50"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              <span>Return to homepage</span>
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export function WidgetErrorBoundary({ title, children }) {
  return (
    <ErrorBoundary compact fallbackTitle={title}>
      {children}
    </ErrorBoundary>
  );
}
