import { Injectable, OnModuleInit } from '@nestjs/common';
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app!: App;
  public db!: Firestore;

  onModuleInit() {
    const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');

    if (!getApps().length) {
      const envServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_CONFIG;
      if (envServiceAccount) {
        try {
          const raw = envServiceAccount.trim().startsWith('{')
            ? envServiceAccount
            : Buffer.from(envServiceAccount, 'base64').toString('utf8');
          const serviceAccount = JSON.parse(raw);
          this.app = initializeApp({
            credential: cert(serviceAccount),
          });
          console.log('🔥 Firebase Cloud Firestore conectado via variável de ambiente (FIREBASE_SERVICE_ACCOUNT)!');
        } catch (err: any) {
          console.warn(`Falha ao carregar credenciais de FIREBASE_SERVICE_ACCOUNT: ${err.message}`);
        }
      }

      if (!this.app && fs.existsSync(serviceAccountPath)) {
        try {
          const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
          this.app = initializeApp({
            credential: cert(serviceAccount),
          });
          console.log('🔥 Firebase Cloud Firestore conectado via serviceAccountKey.json!');
        } catch (err: any) {
          console.warn(`Falha ao ler serviceAccountKey.json: ${err.message}`);
        }
      }

      if (!this.app) {
        try {
          this.app = initializeApp();
          console.log('🔥 Firebase inicializado com credenciais padrão do ambiente.');
        } catch (err: any) {
          console.warn(`Firebase fallback initialization: ${err.message}`);
        }
      }
    } else {
      this.app = getApps()[0];
    }

    try {
      this.db = getFirestore(this.app);
    } catch (err: any) {
      console.warn(`Firestore getFirestore: ${err.message}`);
    }
  }
}
