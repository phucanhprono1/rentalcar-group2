package fa.training.carrental.services.impl;

import fa.training.carrental.services.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service

public class EmailServiceImpl  implements EmailService {
    @Value("${spring.mail.username}")
    private String fromEmail;
    @Value("${allowed-origins}")
    private String clientLink;
    private final JavaMailSender javaMailSender;

    public EmailServiceImpl(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    @Override
    @Async
    public void sendBookingConfirmationEmail(String carName, String customerEmail, Long carId, LocalDateTime bookedAt) {
        try {

            String detailLink=clientLink+"/car-owner/car-detail/"+carId;
            String walletLink=clientLink+"/wallet";
            String htmlContent = "<!DOCTYPE html>"
                    + "<html lang=\"en\">"
                    + "<head>"
                    + "<meta charset=\"UTF-8\">"
                    + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
                    + "<title>Password Reset</title>"
                    + "<style>"
                    + "body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; color: #333; }"
                    + ".container { max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }"
                    + ".footer { margin-top: 20px; padding: 10px 0; text-align: center; border-top: 1px solid #ddd; font-size: 14px; color: #777; }"
                    + "</style>"
                    + "</head>"
                    + "<body>"
                    + "<p> Congratulations! Your car <strong>" + carName + "</strong> has been booked at "+bookedAt.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))+".</p>"
                    + "<p> Please go to your <a href=\"" + walletLink + "\">wallet</a>  to check if the deposit \n" +
                    "has been paid and go to your car’s <a href=\""+detailLink+"\">details page</a> to confirm the deposit</p>"
                    + "<p>Thank you!</p>"
                    + "</body>"
                    + "</html>";

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(customerEmail);
            helper.setSubject("Your car has been booked");
            helper.setText(htmlContent, true);

            javaMailSender.send(message);


        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    @Async
    public void sendBookingCancellationEmail(String carName, String carOwnerEmail, LocalDateTime cancelledAt) {
        try{
            String htmlContent = "<!DOCTYPE html>"
                    + "<html lang=\"en\">"
                    + "<head>"
                    + "<meta charset=\"UTF-8\">"
                    + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
                    + "<title>Password Reset</title>"
                    + "<style>"
                    + "body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; color: #333; }"
                    + ".container { max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }"
                    + ".footer { margin-top: 20px; padding: 10px 0; text-align: center; border-top: 1px solid #ddd; font-size: 14px; color: #777; }"
                    + "</style>"
                    + "</head>"
                    + "<body>"
                    + "<p>Please be informed that a booking with your car  <strong>" + carName + "</strong> has been cancelled at " + cancelledAt.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + ".</p>"
                    + "<p>The deposit will be returned to the customer’s wallet</p>"
                    + "</body>"
                    + "</html>";

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(carOwnerEmail);
            helper.setSubject(" A booking with your car has been cancelled");
            helper.setText(htmlContent, true);

            javaMailSender.send(message);


        } catch (Exception e) {
            e.printStackTrace();

        }
    }

    @Override
    @Async
    public void sendReturnCarEmail(String carName,Long carId, String carOwnerEmail, LocalDateTime returnedAt) {
        try{
            String detailLink=clientLink+"/car-owner/car-detail/"+carId;
            String walletLink=clientLink+"/wallet";
            String htmlContent = "<!DOCTYPE html>"
                    + "<html lang=\"en\">"
                    + "<head>"
                    + "<meta charset=\"UTF-8\">"
                    + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
                    + "<title>Password Reset</title>"
                    + "<style>"
                    + "body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; color: #333; }"
                    + ".container { max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }"
                    + ".footer { margin-top: 20px; padding: 10px 0; text-align: center; border-top: 1px solid #ddd; font-size: 14px; color: #777; }"
                    + "</style>"
                    + "</head>"
                    + "<body>"
                    + "<p>Please be informed that your car <strong>" + carName + "</strong> has been returned at " + returnedAt.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + ".</p>"
                    + "<p> Please go to your <a href=\"" + walletLink + "\">wallet</a>  to check if the deposit \n"
                    + "has been paid and go to your car’s <a href=\""+detailLink+"\">details page</a> to confirm the payment</p>"
                    + "<p>Thank you!</p>"
                    + "</body>"
                    + "</html>";

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(carOwnerEmail);
            helper.setSubject("Your car has been returned");
            helper.setText(htmlContent, true);

            javaMailSender.send(message);


        } catch (Exception e) {
            e.printStackTrace();

        }
    }

    @Override
    @Async
    public void sendWalletChangeEmail(String userEmail, LocalDateTime changeAt) {
        try{
            System.out.println("Im in here, your send wallet change email"+userEmail);
            String walletLink=clientLink+"/wallet";
            String htmlContent = "<!DOCTYPE html>"
                    + "<html lang=\"en\">"
                    + "<head>"
                    + "<meta charset=\"UTF-8\">"
                    + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
                    + "<title>Password Reset</title>"
                    + "<style>"
                    + "body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; color: #333; }"
                    + ".container { max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }"
                    + ".footer { margin-top: 20px; padding: 10px 0; text-align: center; border-top: 1px solid #ddd; font-size: 14px; color: #777; }"
                    + "</style>"
                    + "</head>"
                    + "<body>"
                    + "<p> Please be inform that your wallet's balance has been updated at " +changeAt.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + "</p>"
                    + "<p>Please go to your " + "<a href=\"" + walletLink + "\">wallet</a>  and view the transactions for more details </p>\n"
                    + "<p>Thank you!</p>"
                    + "</body>"
                    + "</html>";

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(userEmail);
            helper.setSubject("There's an update to your wallet");
            helper.setText(htmlContent, true);
            javaMailSender.send(message);


        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
