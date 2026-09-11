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
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        this.app = initializeApp({
          credential: cert(serviceAccount),
        });
      } else {
        // Fallback default app
        this.app = initializeApp();
      }
    } else {
      this.app = getApps()[0];
    }

    this.db = getFirestore(this.app);
    console.log('🔥 Firebase Cloud Firestore conectado com sucesso na API!');
  }
}
