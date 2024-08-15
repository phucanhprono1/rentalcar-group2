import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { HeaderComponent } from './component/header/header.component';
import { FooterComponent } from './component/footer/footer.component';
import { SelectUserRoleComponent } from './component/select-user-role/select-user-role.component';
import { WhyUsComponent } from './component/why-us/why-us.component';
import { PeopleCommentComponent } from './component/people-comment/people-comment.component';
import { CarLocationComponent } from './component/car-location/car-location.component';
import { HomePageCarOwnerComponent } from './component/home-page-car-owner/home-page-car-owner.component';
import { HomePageGuestComponent } from './component/home-page-guest/home-page-guest.component';
import { ForgotPasswordComponent } from './component/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './component/reset-password/reset-password.component';
import { ProfileComponent } from './component/profile/profile.component';
import { AddACarComponent } from "./component/add-a-car/add-a-car.component";
import { StepOneComponent } from "./component/step-one/step-one.component";
import { StepTwoComponent } from "./component/step-two/step-two.component";
import { StepThreeComponent } from "./component/step-three/step-three.component";
import { StepFourComponent } from "./component/step-four/step-four.component";
import { DropZoneComponent } from "./component/drop-zone/drop-zone.component";
import { FilePreviewComponentComponent } from "./component/file-preview-component/file-preview-component.component";
import { DragAndDropDirective } from "./directives/drag-and-drop.directive";
import { BreadcrumbComponent } from "./component/breadcrumb/breadcrumb.component";
import { HomePageCustomerComponent } from './component/home-page-customer/home-page-customer.component';
import { ViewBookingListComponent } from './component/view-booking-list/view-booking-list.component';
import { AuthGuardService as AuthGuard } from "./services/auth-guard.service";
import { NotFoundComponent } from './component/errors/not-found/not-found.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {JwtModule} from "@auth0/angular-jwt";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {ListMyCarsComponent} from "./component/list-my-cars/list-my-cars.component";
import { RentACarComponent } from './component/rent-a-car/rent-a-car.component';
import { BookingInformationComponent } from './component/rent-a-car/booking-information/booking-information.component';
import { PaymentComponent } from './component/rent-a-car/payment/payment.component';
import { FinishComponent } from './component/rent-a-car/finish/finish.component';
import { CarBookingInfoComponent } from './component/rent-a-car/car-booking-info/car-booking-info.component';
import { VnMoneyFormatterPipe } from './shared/vn-money-formatter.pipe';
import { CarRatingStarComponent } from './component/car-rating-star/car-rating-star.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {SearchCarComponent} from "./component/search-car/search-car.component";
import {ThumbNailViewComponent} from "./component/search-car/thumb-nail-view/thumb-nail-view.component";
import {ListViewComponent} from "./component/search-car/list-view/list-view.component";
import {EditCarDetailComponent} from "./component/edit-car-detail/edit-car-detail.component";
import { ViewCarDetailCustomerComponent } from './component/view-car-detail-customer/view-car-detail-customer.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ConfirmDepositComponent } from './component/modal/confirm-deposit/confirm-deposit.component';
import {ConfirmPaymentComponent} from "./component/modal/confirm-payment/confirm-payment.component";

import { ViewWalletComponent } from './component/view-wallet/view-wallet.component';
import { DateTimeFormatterPipe } from './shared/date-time-formatter.pipe';
import { MyReportsComponent } from './component/my-reports/my-reports.component';
import { CardFeedbackComponent } from './component/my-reports/card-feedback/card-feedback.component';
import {BookingDetailsComponent} from "./component/booking-details/booking-details.component";
import {FeedbackService} from "./services/feedback.service";
import { TruncateLongNamePipe } from './shared/truncate-long-name.pipe';
import {AuthInterceptor} from "./auth.interceptor";
import { FlappyBirdComponent } from './component/flappy-bird/flappy-bird.component';


const routes: Routes = [
  {
    path: '',
    component: HomePageGuestComponent,
    title:'Home page guest',
    data: { breadcrumb: 'Home' }
  },
  { path: 'customer', component: HomePageCustomerComponent,title: 'Homepage customer', data: { breadcrumb: 'Home Page Customer', roles:['ROLE_CUSTOMER'] }, canActivate: [AuthGuard], },
  { path: 'car-owner', component: HomePageCarOwnerComponent,title: 'Homepage car owner', data: { breadcrumb: 'Home Page Car Owner', roles:['ROLE_CAR_OWNER'] }, canActivate: [AuthGuard], },
  {
    path: 'car-owner/add-car',
    component: AddACarComponent,
    title: 'Add a car',
    data: { breadcrumb: 'Add a car', roles: ['ROLE_CAR_OWNER'] },
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'step-1', pathMatch: 'full' },
      { path: 'step-1', component: StepOneComponent, data: { breadcrumb: 'Step 1',roles:['ROLE_CAR_OWNER'] }, canActivate: [AuthGuard], },
      { path: 'step-2', component: StepTwoComponent, data: { breadcrumb: 'Step 2',roles:['ROLE_CAR_OWNER'] }, canActivate: [AuthGuard], },
      { path: 'step-3', component: StepThreeComponent, data: { breadcrumb: 'Step 3',roles:['ROLE_CAR_OWNER'] }, canActivate: [AuthGuard], },
      { path: 'step-4', component: StepFourComponent, data: { breadcrumb: 'Step 4',roles:['ROLE_CAR_OWNER'] }, canActivate: [AuthGuard], }
    ]
  },
  {
    path: 'car-owner/my-cars',
    component: ListMyCarsComponent,
    data: {breadcrumb: 'My Cars', roles: ['ROLE_CAR_OWNER']}, canActivate: [AuthGuard],
  },
  {
    path: 'car-owner/car-detail/:id',
    component: EditCarDetailComponent,
    title: 'Edit car details',
    data: {breadcrumb: 'Edit details', roles: ['ROLE_CAR_OWNER']}, canActivate: [AuthGuard]
  },
  {
    path: 'car-owner/view-feedbacks/:id',
    component: MyReportsComponent,
    title: 'My Reports',
    data: {breadcrumb: 'My Reports', roles: ['ROLE_CAR_OWNER']}, canActivate: [AuthGuard]
  },
  { path: 'forgot-password', component: ForgotPasswordComponent, data: { breadcrumb: 'Forgot Password' }},
  { path: 'customer/view-booking-list', component: ViewBookingListComponent, data: { breadcrumb: 'My Bookings', roles:['ROLE_CUSTOMER'] }, canActivate: [AuthGuard],},
  { path: 'reset-password', component: ResetPasswordComponent, data: { breadcrumb: 'Reset Password' } },
  { path: 'reset-password/:token', component: ResetPasswordComponent, data: { breadcrumb: 'Reset Password' } },
  { path: 'edit-profile', component: ProfileComponent,data: { breadcrumb: 'Edit Profile', roles:['ROLE_CUSTOMER','ROLE_CAR_OWNER'] },canActivate: [AuthGuard]},
  { path: 'flappy', component: FlappyBirdComponent,data: { breadcrumb: 'Flappy Car'}},
  { path: 'customer/rent-a-car',
    component: RentACarComponent,
    data: { breadcrumb: 'Book car', roles:['ROLE_CUSTOMER'] },
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'booking-info', pathMatch: 'full' },
      { path: 'booking-info', component: BookingInformationComponent, data: { breadcrumb: 'Step 1',roles:['ROLE_CUSTOMER'] }, canActivate: [AuthGuard], },
      { path: 'payment', component: PaymentComponent, data: { breadcrumb: 'Step 2',roles:['ROLE_CUSTOMER'] }, canActivate: [AuthGuard] },
      { path: 'finish', component: FinishComponent, data: { breadcrumb: 'Step 3',roles:['ROLE_CUSTOMER'] }, canActivate: [AuthGuard] },
      { path: 'car-booking-info', component: CarBookingInfoComponent, data: { breadcrumb: '',roles:['ROLE_CUSTOMER'] }, canActivate: [AuthGuard]}
    ]
  },
  { path: 'customer/search-car',
    component: SearchCarComponent,
    title: 'Search car',
    data: { breadcrumb: 'Search car', roles:['ROLE_CUSTOMER'] },
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'thumbnail-view', pathMatch: 'full' },
      { path: 'thumbnail-view', component: ThumbNailViewComponent, data: { breadcrumb: 'Thumbnail view',roles:['ROLE_CUSTOMER'] }, canActivate: [AuthGuard], },
      { path: 'list-view', component: ListViewComponent, data: { breadcrumb: 'List view',roles:['ROLE_CUSTOMER'] }, canActivate: [AuthGuard], },
    ]
  },
  { path: 'customer/search-car/view-detail/:id',title:'View car detail', component: ViewCarDetailCustomerComponent,data: { breadcrumb: 'View car detail', roles:['ROLE_CUSTOMER','ROLE_CAR_OWNER'] },canActivate: [AuthGuard]},
  { path: 'customer/view-booking-list/booking-detail/:id', component: BookingDetailsComponent, data: {breadcrumb: 'Booking detail',roles:['ROLE_CUSTOMER']},canActivate: [AuthGuard] },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'wallet', component: ViewWalletComponent },
  { path: '**', redirectTo: 'not-found', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SelectUserRoleComponent,
    WhyUsComponent,
    PeopleCommentComponent,
    CarLocationComponent,
    HomePageCarOwnerComponent,
    HomePageGuestComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ProfileComponent,
    AddACarComponent,
    StepOneComponent,
    StepTwoComponent,
    StepThreeComponent,
    StepFourComponent,
    DropZoneComponent,
    FilePreviewComponentComponent,
    DragAndDropDirective,
    BreadcrumbComponent,
    HomePageCustomerComponent,
    ViewBookingListComponent,
    NotFoundComponent,
    NotFoundComponent,
    RentACarComponent,
    BookingInformationComponent,
    PaymentComponent,
    FinishComponent,
    CarBookingInfoComponent,
    VnMoneyFormatterPipe,
    CarRatingStarComponent,
    SearchCarComponent,
    ThumbNailViewComponent,
    ListViewComponent,
    EditCarDetailComponent,
    ListViewComponent,
    ViewCarDetailCustomerComponent,
    ListMyCarsComponent,
    ConfirmDepositComponent,
    ConfirmPaymentComponent,
    ViewWalletComponent,
    DateTimeFormatterPipe,
    MyReportsComponent,
    CardFeedbackComponent,
    BookingDetailsComponent,
    TruncateLongNamePipe,
    FlappyBirdComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: () => localStorage.getItem('token'),
      },
    }),
    NgOptimizedImage,
    NgbModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    FeedbackService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

