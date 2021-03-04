export const ConfigServiceMock = {
  get(key: string): string {
    switch (key) {
      case 'JWT_EXPIRATION_TIME':
        return '3600';
    }
  },
};
