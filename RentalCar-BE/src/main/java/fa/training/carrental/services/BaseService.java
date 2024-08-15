package fa.training.carrental.services;

import java.util.List;

public interface BaseService<T, ID> {

    T save(T entity);

    List<T> findAll();

    T findById(ID id);

    void deleteById(ID id);
}
