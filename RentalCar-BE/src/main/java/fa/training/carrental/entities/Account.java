package fa.training.carrental.entities;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import fa.training.carrental.enums.ERole;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @JsonIgnore
    private String password;

    @Column(unique = true, nullable = false)
    @Email
    private String email;

    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL)
    @JoinColumn(name = "carOwner_id", referencedColumnName = "id")
    @ToString.Exclude
    @JsonManagedReference
    private CarOwner carOwner;

    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL)
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    @ToString.Exclude
    @JsonManagedReference
    private Customer customer;
    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL,fetch = FetchType.EAGER)
    @JoinColumn(name = "passwordResetToken_id", referencedColumnName = "id")
    @ToString.Exclude
    @JsonManagedReference
    private PasswordResetToken passwordResetToken;
    @Enumerated(EnumType.STRING)
    private ERole role;

    public ERole getRole() {
        return this.carOwner != null ? ERole.ROLE_CAR_OWNER : ERole.ROLE_CUSTOMER;
    }
    @Column(nullable = false,columnDefinition = "NVARCHAR(255)")
    private String name;

    @PrePersist
    @PreUpdate
    public void syncEmail() {
        if (this.carOwner != null) {
            this.email = this.carOwner.getEmail();
            this.name = this.carOwner.getName();
        } else if (this.customer != null) {
            this.email = this.customer.getEmail();
            this.name = this.customer.getName();
        }
    }
    @OneToMany(mappedBy = "account")
    @ToString.Exclude
    @JsonManagedReference
    private List<RefreshToken> refreshToken;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority(getRole().name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
    @OneToMany
    @ToString.Exclude
    @JsonManagedReference
    private List<Transaction> transactions;
}