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
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="rounded-full bg-destructive/10 p-4 mb-4">
            <AlertTriangle className="size-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            Erro{this.props.fallbackLabel ? ` em ${this.props.fallbackLabel}` : ""}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            {this.state.error?.message ?? "Ocorreu um erro inesperado."}
          </p>
          <Button onClick={this.handleReset} variant="outline" size="sm">
            <RotateCcw className="size-3.5 mr-1.5" />
            Tentar novamente
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
