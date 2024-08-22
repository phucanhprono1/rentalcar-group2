package fa.training.carrental.config;

import fa.training.carrental.dto.BookingCarResponse;
import fa.training.carrental.dto.bookingdto.BookingCarRequest;
import fa.training.carrental.dto.bookingdto.BookingKafkaMessage;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.*;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.listener.KafkaMessageListenerContainer;
import org.springframework.kafka.requestreply.ReplyingKafkaTemplate;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableKafka
public class KafkaConfig {
    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;
    @Bean
    public ConsumerFactory<String, BookingKafkaMessage> consumerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ConsumerConfig.GROUP_ID_CONFIG, "bookingGroup");
        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);

        JsonDeserializer<BookingKafkaMessage> deserializer = new JsonDeserializer<>(BookingKafkaMessage.class);
        deserializer.addTrustedPackages("*");
        deserializer.setUseTypeHeaders(false);  // Disable type headers if not needed

        return new DefaultKafkaConsumerFactory<>(configProps, new StringDeserializer(), deserializer);
    }

    @Bean
    public KafkaTemplate<String, BookingCarRequest> kafkaTemplate(ProducerFactory<String, BookingCarRequest> producerFactory) {
        return new KafkaTemplate<>(producerFactory);
    }

    @Bean
    public KafkaTemplate<String, BookingKafkaMessage> bookingKafkaMessageKafkaTemplate(ProducerFactory<String, BookingKafkaMessage> producerFactory) {
        return new KafkaTemplate<>(producerFactory);
    }

    @Bean
    public ReplyingKafkaTemplate<String, BookingKafkaMessage, BookingCarResponse> replyingKafkaTemplate(
            ProducerFactory<String, BookingKafkaMessage> pf,
            KafkaMessageListenerContainer<String, BookingCarResponse> container) {
        return new ReplyingKafkaTemplate<>(pf, container);
    }

    @Bean
    public KafkaMessageListenerContainer<String, BookingCarResponse> replyContainer(
            ConsumerFactory<String, BookingCarResponse> cf) {
        ContainerProperties containerProperties = new ContainerProperties("bookingReplies");
        return new KafkaMessageListenerContainer<>(cf, containerProperties);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, BookingKafkaMessage> kafkaListenerContainerFactory(
            ConsumerFactory<String, BookingKafkaMessage> consumerFactory) {
        ConcurrentKafkaListenerContainerFactory<String, BookingKafkaMessage> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory);
        factory.setReplyTemplate(bookingKafkaMessageKafkaTemplate(bookingKafkaMessageProducerFactory()));
        return factory;
    }

    @Bean
    public ProducerFactory<String, BookingCarRequest> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        configProps.put(ProducerConfig.MAX_BLOCK_MS_CONFIG, 120000); // 2 minutes
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public ProducerFactory<String, BookingKafkaMessage> bookingKafkaMessageProducerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        configProps.put(ProducerConfig.MAX_BLOCK_MS_CONFIG, 120000); // 2 minutes
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public ConsumerFactory<String, BookingCarResponse> bookingCarResponseConsumerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ConsumerConfig.GROUP_ID_CONFIG, "bookingGroup");
        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);

        JsonDeserializer<BookingCarResponse> deserializer = new JsonDeserializer<>(BookingCarResponse.class);
        deserializer.addTrustedPackages("*");
        deserializer.setUseTypeHeaders(false);  // Disable type headers if not needed

        return new DefaultKafkaConsumerFactory<>(configProps, new StringDeserializer(), deserializer);
    }
    @Bean
    public NewTopic bookingsTopic() {
        return TopicBuilder.name("bookings")
                .partitions(1)
                .replicas(1)
                .build();
    }
}