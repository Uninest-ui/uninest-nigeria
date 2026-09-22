import * as React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('UniNest ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('uninest_current_user');
    } catch {
      // ignore
    }
    (this as any).setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    const st = (this as any).state as State;
    if (st.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#0A1931] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-slate-100">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
              !
            </div>
            <h2 className="text-xl font-black text-[#0A1931]">Something unexpected occurred</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              We encountered an issue loading this section. Click below to safely reload the UniNest app and return to the main portal.
            </p>
            {st.error && (
              <pre className="p-3 bg-slate-50 rounded-xl text-[10px] text-left text-slate-700 font-mono overflow-x-auto max-h-24">
                {st.error.message || String(st.error)}
              </pre>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-3 px-4 rounded-xl bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-xs transition cursor-pointer shadow-md"
            >
              Reload UniNest Portal
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
