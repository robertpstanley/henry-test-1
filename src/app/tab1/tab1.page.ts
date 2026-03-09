import { Component, OnInit } from '@angular/core';
import { Amplify } from 'aws-amplify';
import { signIn, signOut, getCurrentUser, fetchAuthSession } from '@aws-amplify/auth';
import { awsConfig } from '../../aws-config';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  isLoggedIn = false;
  loading = false;
  error = '';
  username = '';
  password = '';
  tokenDetails: any = null;

  constructor() {
    // Configure Amplify
    Amplify.configure(awsConfig);
  }

  async ngOnInit() {
    // Check if user is already logged in
    await this.checkAuthStatus();
  }

  async checkAuthStatus() {
    try {
      const user = await getCurrentUser();
      if (user) {
        this.isLoggedIn = true;
        await this.loadTokenDetails();
      }
    } catch (error) {
      // User is not logged in
      this.isLoggedIn = false;
    }
  }

  async login() {
    if (!this.username || !this.password) {
      this.error = 'Please enter username and password';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const { isSignedIn } = await signIn({
        username: this.username,
        password: this.password
      });

      if (isSignedIn) {
        this.isLoggedIn = true;
        await this.loadTokenDetails();
        // Clear password for security
        this.password = '';
      }
    } catch (error: any) {
      console.error('Login error:', error);
      this.error = error.message || 'Login failed. Please check your credentials.';
    } finally {
      this.loading = false;
    }
  }

  async logout() {
    this.loading = true;
    this.error = '';

    try {
      await signOut();
      this.isLoggedIn = false;
      this.tokenDetails = null;
      this.username = '';
      this.password = '';
    } catch (error: any) {
      console.error('Logout error:', error);
      this.error = error.message || 'Logout failed';
    } finally {
      this.loading = false;
    }
  }

  async loadTokenDetails() {
    try {
      const session = await fetchAuthSession();
      const user = await getCurrentUser();
      
      this.tokenDetails = {
        username: user.username,
        userId: user.userId,
        idToken: session.tokens?.idToken?.toString(),
        accessToken: session.tokens?.accessToken?.toString(),
      };
    } catch (error) {
      console.error('Error loading token details:', error);
    }
  }
}

// Made with Bob
