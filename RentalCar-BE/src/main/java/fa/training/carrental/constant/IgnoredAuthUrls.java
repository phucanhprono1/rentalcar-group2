package fa.training.carrental.constant;

import java.util.stream.Stream;

public final class IgnoredAuthUrls {
    private IgnoredAuthUrls() {
        // Prevent create object instance
    }

    public static final String[] STATIC_RESOURCE_PREFIX_PATH = {
            "/css/**", "/img/**", "/js/**", "/plugins/**", "/public/**"
    };

    public static final String[] SWAGGER_PREFIX_PATH = {"/v1/api-docs", "/swagger-ui.html", "/swagger-ui/**", "/swagger-resources/**", "/webjars/**"};

    public static final String[] ERROR_PREFIX_PATH = {"/error/**"};

    public static final String[] AUTH_PREFIX_PATH = {"api/auth/**"};
    public static final String[] DATA_PREFIX_PATH = {"api/brandModel/**","api/color/**","api/cityProvince/**","api/district/**","api/ward/**"};

    public static final String[] ALL_PATH = paths();

    private static String[] paths() {
        return Stream.of(
                        STATIC_RESOURCE_PREFIX_PATH, SWAGGER_PREFIX_PATH, ERROR_PREFIX_PATH, AUTH_PREFIX_PATH,DATA_PREFIX_PATH)
                .flatMap(Stream::of)
                .toArray(String[]::new);
    }
}