import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {WalletService} from 'src/app/services/wallet.service';
import {AuthService} from '../../services/auth.service';
import * as bootstrap from 'bootstrap';
import {Modal} from "bootstrap";
import {Toast} from "bootstrap";
import {Router} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";


@Component({
  selector: 'app-view-wallet',
  templateUrl: './view-wallet.component.html',
  styleUrls: ['./view-wallet.component.css']
})
export class ViewWalletComponent implements OnInit {
  isLoading = false;
  currentBalance: number = 0;
  token: string = '';
  topUpAmount: number = 2000000;
  withdrawAmount: number = 2000000;
  fromDate: string = '';
  toDate: string = '';
  transactions: any[] = [];
  page: number = 1;
  size: number = 10;
  totalPages: number = 1;


  constructor(private walletService: WalletService, private authService: AuthService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.token = localStorage.getItem('token') || ''; // Assuming your AuthService has a getToken method
    this.getWallet();
    this.initListTransaction();
  }

  getWallet(): void {
    this.walletService.getWallet(this.token).subscribe(
      (response: any) => {
        console.log('Wallet balance:', response.balance);
        this.currentBalance = Number(response.balance); // Ensure balance is a number
      },
      (error: any) => {
        console.error('Error fetching wallet balance', error);
      }
    );
  }

  topUp(amount: number): void {
    this.isLoading = true;
    amount = Number(amount); // Ensure amount is a number
    this.walletService.topUp(this.token, amount).subscribe({
      next: (response: any) => {
        this.currentBalance += amount;
        this.topUpAmount = 0; // Reset the top-up amount
        this.showSuccessToast('Top-up successful!');
        setTimeout(() => {
          this.forceRemoveModal();
          window.location.reload();
        }, 1000);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error topping up', error);
        let errorMessage = 'An unexpected error occurred';
        if (error.status === 400) {
          errorMessage = error.error || 'Invalid request';
        } else if (error.status === 404) {
          errorMessage = error.error || 'Account not found';
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to the server';
        }
        this.isLoading = false;
        this.showFailToast(errorMessage);
      },
  });
  }

  @ViewChild('successTopUp') successTopUp!: ElementRef;

  private forceRemoveModal(): void {
    // Remove modal backdrop
    const modalBackdrops = document.querySelectorAll('.modal-backdrop');
    modalBackdrops.forEach(backdrop => backdrop.remove());

    // Remove 'modal-open' class from body
    document.body.classList.remove('modal-open');

    // Remove inline styles added by Bootstrap
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');

    // Force hide the modal
    const modalElement = this.successTopUp.nativeElement;
    modalElement.style.display = 'none';
    modalElement.classList.remove('show');
    modalElement.setAttribute('aria-hidden', 'true');
    modalElement.removeAttribute('aria-modal');
    modalElement.removeAttribute('role');
  }

  @ViewChild('successToast') successToast!: ElementRef;
  @ViewChild('failToast') failToast!: ElementRef;


  withdraw(amount: number): void {
    this.isLoading = true;
    amount = Number(amount); // Ensure amount is a number
    this.walletService.withdraw(this.token, amount).subscribe({
      next: (response: any) => {
        this.currentBalance -= amount;
        this.withdrawAmount = 0; // Reset the withdrawal amount
        this.showSuccessToast('Withdrawal successful!');
        setTimeout(() => {
          this.forceRemoveModal();
          window.location.reload();
        }, 1000);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error withdrawing', error);
        let errorMessage = 'An unexpected error occurred';

        if (error.status === 400) {
          errorMessage = error.error || 'Invalid request';
        } else if (error.status === 404) {
          errorMessage = error.error || 'Account not found';
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to the server';
        }
        this.isLoading = false;
        this.showFailToast(errorMessage);
      },
    });
  }

  private showSuccessToast(message: string): void {
    const toastElement = this.successToast.nativeElement;
    toastElement.querySelector('.toast-body').textContent = message;
    const toast = new Toast(toastElement, {autohide: true, delay: 3000});
    toast.show();
  }

  private showFailToast(message: string): void {
    const toastElement = this.failToast.nativeElement;
    toastElement.querySelector('.toast-body').textContent = message;
    const toast = new Toast(toastElement, {autohide: true, delay: 3000});
    toast.show();
  }


  initListTransaction(): void {
    this.page = 1;
    this.walletService.getTransactionHistoryDefault(this.token, this.page, this.size).subscribe(
      (response: any) => {
        this.transactions = response.content;
        this.totalPages = response.totalPages;
      },
      (error: any) => {
        console.error('Error fetching transactions', error);
      }
    );
  }

  searchTransactions(): void {
    const formattedFromDate = this.formatDateTimeRequest(this.fromDate);
    const formattedToDate = this.formatDateTimeRequest(this.toDate);

    this.walletService.getTransactionHistory(this.token, this.page, this.size, formattedFromDate, formattedToDate).subscribe(
      (response: any) => {
        this.transactions = response.content;
        this.totalPages = response.totalPages;
      },
      (error: any) => {
        console.error('Error fetching transactions', error);
      }
    );
  }

  formatDateTimeRequest(dateTime: string): string {
    if (!dateTime) return '';
    const date = new Date(dateTime);// Remove the milliseconds and timezone part
    return date.toISOString().slice(0, 19);
  }

  formatDateTime(dateTime: string): string {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based.
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  setTransactionType(type: string): string {
    if (type === 'TOP_UP') return 'Top-up';
    if (type === 'WITHDRAW') return 'Withdraw';
    if (type === 'PAY_DEPOSIT') return 'Pay deposit';
    if (type === 'RECEIVE_DEPOSIT') return 'Receive deposit';
    if (type === 'OFFSET_FINAL_PAYMENT') return 'Offset final payment';
    if (type === 'REFUND_DEPOSIT') return 'Refund deposit';
    return type;
  }

  changePageSize(event: any): void {
    this.size = event.target.value;
    this.page = 1; // Reset to first page
    this.searchTransactions();
  }

  getPageNumbers(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  changePage(newPage: number): void {
    this.page = newPage;
    this.searchTransactions();
  }
}

