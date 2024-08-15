package fa.training.carrental.controllers;

import fa.training.carrental.dto.EditPasswordRequest;
import fa.training.carrental.dto.EditProfileRequest;
import fa.training.carrental.dto.ProfileResponse;
import fa.training.carrental.entities.Account;
import fa.training.carrental.services.EditProfileService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.logging.Logger;

@RestController
@RequestMapping("api/edit-profile")
@Slf4j
public class EditProfileController {
    private final EditProfileService profileService;

    public EditProfileController(EditProfileService profileService) {
        this.profileService = profileService;
    }
    Logger logger = Logger.getLogger(EditProfileController.class.getName());


    @PutMapping(value = "/edit-info", consumes = "multipart/form-data")
    public ResponseEntity<?> editProfile(@RequestPart(name = "file", required = false) MultipartFile file,
                                         @RequestPart(name = "request") @Valid EditProfileRequest request,
                                         BindingResult bindingResult) {
        Map<String, String> errors = new HashMap<>();
        logger.info(request.toString());

        if (file != null) {
            // Validate file type
            if (!Objects.requireNonNull(file.getContentType()).startsWith("image/")) {
                errors.put("file", "Only image files are allowed (JPEG, PNG, GIF)");
            }
        }

        if (bindingResult.hasErrors() || !errors.isEmpty()) {
            bindingResult.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }

        return ResponseEntity.ok(profileService.editProfile(request, file));
    }

    @PutMapping("/edit-password")
    public ResponseEntity<?> editPassword( @RequestBody @Valid EditPasswordRequest request, BindingResult bindingResult) {
        if(bindingResult.hasErrors()){
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }
        else {
            Account account = profileService.getAccount(request.getEmail()).orElseThrow(
                    () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found for email: " + request.getEmail())
            );
            String password = account.getPassword();
            System.out.println(password);
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            boolean isMatchedPassword = encoder.matches(request.getOldPassword(), password);
            if (!isMatchedPassword) {
                Map<String, String> errors = new HashMap<>();
                errors.put("Error", "Current password is incorrect");
                return ResponseEntity.badRequest().body(errors);
            }
        }
        return ResponseEntity.ok(profileService.editPassword(request));
    }
    @GetMapping("/get-profile")
    public ResponseEntity<?> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println(authentication.getName());
        if(authentication.getName().equals("anonymousUser")|| !authentication.isAuthenticated()){
            return ResponseEntity.unprocessableEntity().body("User is not authenticated");
        }
        ProfileResponse profile = profileService.getProfile(authentication.getName());
        if(profile == null){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(profile);
    }
}
