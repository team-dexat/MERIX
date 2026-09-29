package gov.doca.merix.service;

import gov.doca.merix.model.Instrument;
import gov.doca.merix.model.User;
import gov.doca.merix.repository.InstrumentRepository;
import gov.doca.merix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InstrumentService {

    private final InstrumentRepository instrumentRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public List<Instrument> getAllInstruments() {
        return instrumentRepository.findAll();
    }

    public List<Instrument> getInstrumentsByUserId(String userId) {
        return instrumentRepository.findByUserId(userId);
    }

    public Optional<Instrument> getInstrumentById(String id) {
        return instrumentRepository.findById(id);
    }

    public Instrument registerInstrument(Instrument instrument, String userId) {
        if (instrument.getId() == null || instrument.getId().isBlank()) {
            long count = instrumentRepository.count() + 101;
            instrument.setId("INS-" + String.format("%06d", count));
        }

        if (userId != null) {
            Optional<User> userOpt = userRepository.findById(userId);
            userOpt.ifPresent(instrument::setUser);
        }

        instrument.setQrCodeData("https://merix.gov.in/verify/instrument/" + instrument.getId());
        Instrument saved = instrumentRepository.save(instrument);

        auditLogService.logAction(
                userId != null ? userId : "SYSTEM",
                instrument.getBusinessName(),
                "BUSINESS_OWNER",
                "REGISTER_INSTRUMENT",
                "INSTRUMENT",
                saved.getId(),
                "Registered " + saved.getInstrumentType() + " (" + saved.getSerialNumber() + ")"
        );

        return saved;
    }

    public List<Instrument> getNearbyInstruments(double lat, double lng, double radiusKm) {
        // Return active instruments for Near Me map
        return instrumentRepository.findAll();
    }
}
