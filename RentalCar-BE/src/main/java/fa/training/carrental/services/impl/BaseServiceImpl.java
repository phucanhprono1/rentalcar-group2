package fa.training.carrental.services.impl;

import fa.training.carrental.repositories.BaseRepository;
import fa.training.carrental.services.BaseService;

import java.util.List;

public class BaseServiceImpl<T, ID> implements BaseService<T, ID> {

    private final BaseRepository<T, ID> baseRepository;

    public BaseServiceImpl(BaseRepository<T, ID> baseRepository) {
        this.baseRepository = baseRepository;
    }

    @Override
    public T save(T entity) {
        return baseRepository.save(entity);
    }

    @Override
    public List<T> findAll() {
        return baseRepository.findAll();
    }

    @Override
    public T findById(ID id) {
        return baseRepository.findById(id).orElse(null);
    }

    @Override
    public void deleteById(ID id) {
        baseRepository.deleteById(id);
    }
}
