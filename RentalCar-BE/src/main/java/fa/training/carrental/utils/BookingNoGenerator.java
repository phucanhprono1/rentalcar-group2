package fa.training.carrental.utils;
import org.hibernate.HibernateException;
import org.hibernate.MappingException;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;
import org.hibernate.id.enhanced.SequenceStyleGenerator;
import org.hibernate.internal.util.config.ConfigurationHelper;
import org.hibernate.service.ServiceRegistry;
import org.hibernate.type.Type;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Properties;

public class BookingNoGenerator implements IdentifierGenerator {

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) throws HibernateException {
        String date = LocalDate.now().format(formatter);
        long sequence = getNextSequenceValue(session);
        return date + "-" + String.format("%d", sequence);
    }

    private long getNextSequenceValue(SharedSessionContractImplementor session) {
        String query = "SELECT COALESCE(MAX(CAST(SUBSTRING(booking_no, 10, LEN(booking_no) - 9) AS BIGINT)), 0) + 1 FROM booking";
        try {
            Number result = (Number) session.createNativeQuery(query).getSingleResult();
            return result != null ? result.longValue() : 1L;
        } catch (Exception e) {
            // If the table is empty or doesn't exist, start from 1
            return 1L;
        }
    }
}