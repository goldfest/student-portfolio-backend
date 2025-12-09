package com.portfolio.services;

import com.portfolio.models.WorkType;
import com.portfolio.repositories.WorkTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkTypeService {

    private final WorkTypeRepository workTypeRepository;

    public List<WorkType> getAllWorkTypes() {
        return workTypeRepository.findAll();
    }

    public WorkType getWorkTypeById(Long id) {
        return workTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Work type not found with id: " + id));
    }

    @Transactional
    public WorkType createWorkType(WorkType workType) {
        return workTypeRepository.save(workType);
    }

    @Transactional
    public WorkType updateWorkType(Long id, WorkType workTypeDetails) {
        WorkType workType = workTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Work type not found with id: " + id));

        workType.setName(workTypeDetails.getName());
        workType.setDescription(workTypeDetails.getDescription());

        return workTypeRepository.save(workType);
    }

    @Transactional
    public void deleteWorkType(Long id) {
        if (!workTypeRepository.existsById(id)) {
            throw new EntityNotFoundException("Work type not found with id: " + id);
        }
        workTypeRepository.deleteById(id);
    }
}