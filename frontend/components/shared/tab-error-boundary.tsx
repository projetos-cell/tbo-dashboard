"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallbackLabel?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class TabErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
          <div className="mb-4 rounded-full bg-red-500/10 p-4">
            <AlertTriangle className="size-8 text-red-500" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">
            Erro{this.props.fallbackLabel ? ` em ${this.props.fallbackLabel}` : ""}
          </h3>
          <p className="mb-4 max-w-sm text-sm text-gray-500">
            {this.state.error?.message ?? "Ocorreu um erro inesperado."}
          </p>
          <Button onClick={this.handleReset} variant="outline" size="sm">
            <RotateCcw className="mr-1.5 size-3.5" />
            Tentar novamente
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
