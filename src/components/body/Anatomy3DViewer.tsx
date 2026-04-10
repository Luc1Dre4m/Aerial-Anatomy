import React, { useRef, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import {
  isBioDigitalConfigured,
  getBioDigitalModelUrl,
  getBioDigitalInjectedJS,
  getDemoHtml,
} from '../../services/biodigital';
import { muscleIdsToBioDigital, biodigitalToMuscleId } from '../../data/biodigitalMapping';
import { colors, typography, spacing } from '../../theme';

interface Anatomy3DViewerProps {
  highlightedMuscles?: string[];
  onMuscleSelect?: (muscleId: string) => void;
}

export const Anatomy3DViewer = React.memo(function Anatomy3DViewer({
  highlightedMuscles = [],
  onMuscleSelect,
}: Anatomy3DViewerProps) {
  const { t } = useTranslation();
  const webViewRef = useRef<WebView>(null);
  const configured = isBioDigitalConfigured();

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'anatomySelected' && data.name) {
          const muscleId = biodigitalToMuscleId(data.name);
          if (muscleId && onMuscleSelect) {
            onMuscleSelect(muscleId);
          }
        }
      } catch {
        // Ignore malformed messages
      }
    },
    [onMuscleSelect]
  );

  // If BioDigital is configured, use the real widget
  if (configured) {
    const biodigitalNames = muscleIdsToBioDigital(highlightedMuscles);
    const url = getBioDigitalModelUrl(biodigitalNames);

    if (!url) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>{t('body.offline3DFallback')}</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webview}
          injectedJavaScript={getBioDigitalInjectedJS()}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.accent.primary} />
              <Text style={styles.loadingText}>{t('body.loading3D')}</Text>
            </View>
          )}
          originWhitelist={['*']}
        />
      </View>
    );
  }

  // Demo mode — show placeholder
  return (
    <View style={styles.container}>
      <WebView
        source={{ html: getDemoHtml() }}
        style={styles.webview}
        javaScriptEnabled={false}
        scrollEnabled={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.bg.primary,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body.regular,
    color: colors.text.muted,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  fallbackText: {
    ...typography.body.regular,
    color: colors.text.muted,
    textAlign: 'center',
  },
});
