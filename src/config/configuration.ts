interface Config {
  server: ServerConfig;
  environment: string;
}

interface ServerConfig {
  port: number;
}

export const configuration = (): Config => {
  const serverConfig: ServerConfig = {
    port: parseInt(process.env.PORT) || 3001,
  };

  return {
    server: serverConfig,
    environment: process.env.NODE_ENV,
  };
};
