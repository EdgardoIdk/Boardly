import { MaterialIcons } from '@expo/vector-icons';
import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, errorInfo, showDetails } = this.state;

    return (
      <View style={{ flex: 1, backgroundColor: '#0a0f1e' }}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 80 }}>

          {/* Icon */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                backgroundColor: 'rgba(239,68,68,0.1)',
                borderWidth: 1,
                borderColor: 'rgba(239,68,68,0.25)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="error-outline" size={40} color="#ef4444" />
            </View>
          </View>

          {/* Title */}
          <Text
            style={{
              color: '#ffffff',
              fontSize: 24,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            {`Algo sali\u00f3 mal`}
          </Text>

          <Text
            style={{
              color: '#4a6fa5',
              fontSize: 14,
              textAlign: 'center',
              marginBottom: 24,
              lineHeight: 20,
            }}
          >
            {`La aplicaci\u00f3n encontr\u00f3 un error inesperado. Puedes intentar reiniciar o revisar los detalles del error.`}
          </Text>

          {/* Error name */}
          <View
            style={{
              backgroundColor: 'rgba(239,68,68,0.08)',
              borderWidth: 1,
              borderColor: 'rgba(239,68,68,0.2)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: '600' }}>
              {error?.name ?? 'Error'}
            </Text>
            <Text style={{ color: '#f87171', fontSize: 12, marginTop: 4, lineHeight: 18 }}>
              {error?.message ?? 'Error desconocido'}
            </Text>
          </View>

          {/* Toggle details */}
          <TouchableOpacity
            onPress={() => this.setState({ showDetails: !showDetails })}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: 10,
              marginBottom: 8,
            }}
          >
            <MaterialIcons
              name={showDetails ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={20}
              color="#4a6fa5"
            />
            <Text style={{ color: '#4a6fa5', fontSize: 13, fontWeight: '500' }}>
              {showDetails ? 'Ocultar detalles' : 'Ver detalles del error'}
            </Text>
          </TouchableOpacity>

          {/* Scrollable stack trace */}
          {showDetails && (
            <View
              style={{
                flex: 1,
                backgroundColor: '#0d1629',
                borderWidth: 1,
                borderColor: 'rgba(13,162,231,0.15)',
                borderRadius: 12,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(13,162,231,0.1)',
                }}
              >
                <MaterialIcons name="code" size={14} color="#0da2e7" />
                <Text style={{ color: '#0da2e7', fontSize: 11, fontWeight: '600', letterSpacing: 1 }}>
                  STACK TRACE
                </Text>
              </View>

              <ScrollView
                style={{ flex: 1, padding: 12 }}
                showsVerticalScrollIndicator
              >
                <Text
                  selectable
                  style={{
                    color: '#8ba3c4',
                    fontSize: 11,
                    fontFamily: 'monospace',
                    lineHeight: 18,
                  }}
                >
                  {error?.stack ?? 'No stack trace disponible'}
                </Text>

                {errorInfo?.componentStack && (
                  <>
                    <View
                      style={{
                        height: 1,
                        backgroundColor: 'rgba(13,162,231,0.1)',
                        marginVertical: 12,
                      }}
                    />
                    <Text
                      style={{
                        color: '#0da2e7',
                        fontSize: 11,
                        fontWeight: '600',
                        letterSpacing: 1,
                        marginBottom: 8,
                      }}
                    >
                      COMPONENT STACK
                    </Text>
                    <Text
                      selectable
                      style={{
                        color: '#8ba3c4',
                        fontSize: 11,
                        fontFamily: 'monospace',
                        lineHeight: 18,
                      }}
                    >
                      {errorInfo.componentStack}
                    </Text>
                  </>
                )}
              </ScrollView>
            </View>
          )}

          {/* Restart button */}
          <TouchableOpacity
            onPress={this.handleRestart}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: '#0da2e7',
              borderRadius: 16,
              paddingVertical: 16,
              marginBottom: 40,
            }}
          >
            <MaterialIcons name="refresh" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
              Reiniciar la app
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
