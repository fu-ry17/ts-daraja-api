declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SHORT_CODE: string;
      CONSUMER_KEY: string;
      CONSUMER_SECRET: string;
      PASS_KEY: string;
      AUTH_URL: string;
    }
  }
}

export {}
