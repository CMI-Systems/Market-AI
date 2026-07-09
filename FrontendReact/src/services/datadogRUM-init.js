import { datadogRum } from '@datadog/browser-rum';
import { reactPlugin } from '@datadog/browser-rum-react';
import { RouterProvider } from 'react-router-dom';
import { datadogRum } from "@datadog/browser-rum";
import { reactPlugin } from "@datadog/browser-rum-react";
import { ErrorBoundary } from '@datadog/browser-rum-react';
import { createBrowserRouter } from '@datadog/browser-rum-react/react-router-v6';

datadogRum.init({
  applicationId: "7f4781a8-0af2-4681-afe1-abbc55b70afa",
  clientToken: "pubfe9292a20f2fb7544f60334f63f50705",
  site: "datadoghq.com",

  service: "ai-database-frontend",
  env: "prod",
  version: "0.1.0",

  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,

  trackResources: true,
  trackUserInteractions: true,
  trackLongTasks: true,

  defaultPrivacyLevel: "mask-user-input",

  plugins: [reactPlugin()],
});

datadogRum.startSessionReplayRecording();
const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    ...
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />,
);

function App() {
    return (
        <ErrorBoundary fallback={ErrorFallback}>
            <MyComponent />
        </ErrorBoundary>
    );
}

function ErrorFallback({ resetError, error }) {
    return (
        <p>
            Oops! <strong>{String(error)}</strong>{' '}
            <button onClick={resetError}>Retry</button>
        </p>
    );
}