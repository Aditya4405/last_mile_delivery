package com.lastmiletracker.order.repository;

import com.lastmiletracker.order.entity.Order;
import com.lastmiletracker.order.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    @EntityGraph(attributePaths = {"sender", "assignedAgent", "assignedAgent.user", "pickupZone", "deliveryZone"})
    Optional<Order> findByTrackingNumber(String trackingNumber);

    boolean existsByTrackingNumber(String trackingNumber);

    @Override
    @EntityGraph(attributePaths = {"sender", "assignedAgent", "assignedAgent.user", "pickupZone", "deliveryZone"})
    Page<Order> findAll(Specification<Order> spec, Pageable pageable);

    // Customer Aggregations
    @Query("SELECT COUNT(o) FROM Order o WHERE o.sender.id = :senderId")
    long countBySenderId(@Param("senderId") Long senderId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.sender.id = :senderId AND o.status = :status")
    long countBySenderIdAndStatus(@Param("senderId") Long senderId, @Param("status") OrderStatus status);

    @Query("SELECT SUM(o.shippingCharge) FROM Order o WHERE o.sender.id = :senderId")
    Double sumShippingChargeBySenderId(@Param("senderId") Long senderId);

    @Query("SELECT SUM(o.codAmount) FROM Order o WHERE o.sender.id = :senderId AND o.isCod = true AND o.status NOT IN ('DELIVERED', 'CANCELLED', 'FAILED')")
    Double sumCodPendingBySenderId(@Param("senderId") Long senderId);

    @Query("SELECT o FROM Order o WHERE o.sender.id = :senderId ORDER BY o.createdAt DESC")
    List<Order> findRecentOrdersBySenderId(@Param("senderId") Long senderId, Pageable pageable);

    // Agent Aggregations
    @Query("SELECT COUNT(o) FROM Order o WHERE o.assignedAgent.id = :agentId AND o.status = :status")
    long countByAssignedAgentIdAndStatus(@Param("agentId") Long agentId, @Param("status") OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.assignedAgent.id = :agentId AND CAST(o.createdAt AS date) = CURRENT_DATE")
    long countTodayOrdersByAgentId(@Param("agentId") Long agentId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.assignedAgent.id = :agentId AND CAST(o.createdAt AS date) = CURRENT_DATE AND o.status = :status")
    long countTodayOrdersByAgentIdAndStatus(@Param("agentId") Long agentId, @Param("status") OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.assignedAgent.id = :agentId ORDER BY o.updatedAt DESC")
    List<Order> findRecentOrdersByAgentId(@Param("agentId") Long agentId, Pageable pageable);

    // Admin/Global Aggregations
    @Query("SELECT SUM(o.shippingCharge) FROM Order o")
    Double sumTotalRevenue();

    @Query("SELECT SUM(o.shippingCharge) FROM Order o WHERE CAST(o.createdAt AS date) = CURRENT_DATE")
    Double sumTodayRevenue();

    @Query("SELECT SUM(o.shippingCharge) FROM Order o WHERE MONTH(o.createdAt) = MONTH(CURRENT_DATE) AND YEAR(o.createdAt) = YEAR(CURRENT_DATE)")
    Double sumCurrentMonthRevenue();

    @Query("SELECT SUM(o.shippingCharge) FROM Order o WHERE YEAR(o.createdAt) = YEAR(CURRENT_DATE)")
    Double sumCurrentYearRevenue();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status IN ('IN_TRANSIT', 'REACHED_HUB', 'OUT_FOR_DELIVERY')")
    long countActiveTransitOrders();

    // Groupings for top metrics
    @Query("SELECT o.sender.id, o.sender.fullName, COUNT(o) as orderCount, SUM(o.shippingCharge) as totalCharge FROM Order o GROUP BY o.sender.id, o.sender.fullName ORDER BY orderCount DESC")
    List<Object[]> findTopCustomers(Pageable pageable);

    @Query("SELECT o.assignedAgent.id, o.assignedAgent.user.fullName, COUNT(o) as orderCount FROM Order o WHERE o.status = 'DELIVERED' GROUP BY o.assignedAgent.id, o.assignedAgent.user.fullName ORDER BY orderCount DESC")
    List<Object[]> findTopAgents(Pageable pageable);

    @Query("SELECT o.pickupZone.id, o.pickupZone.name, COUNT(o) as orderCount FROM Order o GROUP BY o.pickupZone.id, o.pickupZone.name ORDER BY orderCount DESC")
    List<Object[]> findTopZones(Pageable pageable);

    @Query("SELECT o.pickupCity, COUNT(o) as orderCount FROM Order o GROUP BY o.pickupCity ORDER BY orderCount DESC")
    List<Object[]> findTopCities(Pageable pageable);
}