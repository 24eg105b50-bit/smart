package com.shopsphere.util;

import com.shopsphere.entity.*;
import com.shopsphere.enums.OrderStatus;
import com.shopsphere.enums.PaymentMethod;
import com.shopsphere.enums.PaymentStatus;
import com.shopsphere.enums.UserRole;
import com.shopsphere.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           AddressRepository addressRepository,
                           OrderRepository orderRepository,
                           ReviewRepository reviewRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.addressRepository = addressRepository;
        this.orderRepository = orderRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial development bootstrap.");
            return;
        }

        log.info("Seeding ShopSphere Campus initial demonstration data...");

        // 1. Create Default Users
        User admin = new User(
                "Prof. Campus Admin",
                "admin@shopsphere.edu",
                passwordEncoder.encode("Admin@123"),
                UserRole.ADMIN
        );
        admin.setPhone("+91 98765 43210");
        userRepository.save(admin);

        User student = new User(
                "Rohith Reddy",
                "student@shopsphere.edu",
                passwordEncoder.encode("Student@123"),
                UserRole.CUSTOMER
        );
        student.setPhone("+91 91234 56789");
        userRepository.save(student);

        // 2. Create Default Address for Student
        Address studentAddress = new Address(
                student,
                "Rohith Reddy",
                "+91 91234 56789",
                "Hostel Block 4, Room 302, University Campus",
                "Visakhapatnam",
                "Andhra Pradesh",
                "530003",
                true
        );
        addressRepository.save(studentAddress);

        // 3. Create Product Categories
        Category catLaptops = categoryRepository.save(new Category(
                "Laptops & Computers",
                "laptops-computers",
                "High performance student laptops for software engineering, competitive coding, and AI coursework",
                "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80"
        ));

        Category catPeripherals = categoryRepository.save(new Category(
                "Computer Peripherals",
                "computer-peripherals",
                "Mechanical keyboards, precision mice, monitors, and ergonomic laptop stands",
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80"
        ));

        Category catAudio = categoryRepository.save(new Category(
                "Headphones & Audio",
                "headphones-audio",
                "Noise-canceling over-ear headphones and earbuds tailored for deep focus and study sessions",
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"
        ));

        Category catBooks = categoryRepository.save(new Category(
                "Engineering Textbooks",
                "engineering-textbooks",
                "Standard reference textbooks aligned with AU-R24 computer science and core engineering subjects",
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80"
        ));

        Category catLab = categoryRepository.save(new Category(
                "Lab Hardware & Kits",
                "lab-hardware",
                "Microcontrollers, development boards, sensor kits, and breadboards for IoT and embedded labs",
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80"
        ));

        Category catStationery = categoryRepository.save(new Category(
                "Stationery & Study",
                "stationery-study",
                "Scientific calculators, grid notebooks, highlighters, and campus examination essentials",
                "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&q=80"
        ));

        // 4. Create 20+ Realistic Products
        List<Product> products = new ArrayList<>();

        products.add(new Product(catLaptops,
                "ThinkPad E14 Gen 5 (Core i5, 16GB RAM, 512GB SSD)",
                "thinkpad-e14-gen-5",
                "Legendary military-grade keyboard with aluminum cover, Intel Core i5 13th Gen, 16GB DDR4, 512GB NVMe SSD, 14-inch IPS FHD display. Ideal for Linux, Docker, and full stack development.",
                "Lenovo", "LEN-TP-E14", new BigDecimal("54990.00"), 12,
                "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80"));

        products.add(new Product(catLaptops,
                "MacBook Air 13-inch M2 (8-core CPU, 16GB, 256GB)",
                "macbook-air-m2-16gb",
                "Apple M2 chip with 8-core CPU and 10-core GPU, 16GB unified memory, Liquid Retina display, 18-hour battery life. Lightweight champion for campus mobility.",
                "Apple", "APL-MBA-M2", new BigDecimal("89990.00"), 8,
                "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&q=80"));

        products.add(new Product(catLaptops,
                "Acer Aspire Lite AMD Ryzen 5 (16GB RAM, 512GB SSD)",
                "acer-aspire-lite-ryzen-5",
                "Affordable student workhorse featuring AMD Ryzen 5 5500U 6-core processor, 16GB RAM, 15.6-inch anti-glare screen. Great budget option for engineering students.",
                "Acer", "ACR-ASP-LITE", new BigDecimal("34990.00"), 15,
                "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80"));

        products.add(new Product(catPeripherals,
                "Keychron K2 V2 Wireless Mechanical Keyboard (Brown Switches)",
                "keychron-k2-v2",
                "75% compact layout with Mac & Windows layout support, hot-swappable Gateron G Pro Brown switches, white LED backlight, and 4000mAh battery for all-day coding.",
                "Keychron", "KEY-K2-BRN", new BigDecimal("6999.00"), 20,
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80"));

        products.add(new Product(catPeripherals,
                "Logitech MX Master 3S Ergonomic Wireless Mouse",
                "logitech-mx-master-3s",
                "Quiet clicks, 8000 DPI track-on-glass sensor, MagSpeed electromagnetic scrolling up to 1000 lines per second. Ergonomic palm support for long research marathons.",
                "Logitech", "LOG-MXM-3S", new BigDecimal("8495.00"), 14,
                "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80"));

        products.add(new Product(catPeripherals,
                "Logitech K380 Multi-Device Bluetooth Keyboard",
                "logitech-k380-wireless",
                "Compact, lightweight Bluetooth keyboard that switches seamlessly across laptop, tablet, and phone with Easy-Switch buttons.",
                "Logitech", "LOG-K380-BLK", new BigDecimal("2495.00"), 25,
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80"));

        products.add(new Product(catPeripherals,
                "Dell 24-inch IPS FHD Monitor (S2421HN) 75Hz",
                "dell-24-inch-ips-monitor",
                "Full HD 1920x1080 IPS panel with ultra-thin bezels, dual HDMI ports, AMD FreeSync, and ComfortView low blue light mode for dual-screen coding setups.",
                "Dell", "DEL-MON-24", new BigDecimal("9899.00"), 7,
                "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80"));

        products.add(new Product(catAudio,
                "Sony WH-1000XM4 Wireless Noise Cancelling Headphones",
                "sony-wh-1000xm4-anc",
                "Industry-leading active noise cancellation with dual noise sensor technology, Speak-to-chat, 30 hours battery life, and high-res audio. Perfect for campus library focus.",
                "Sony", "SNY-WH-1000XM4", new BigDecimal("19990.00"), 6,
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"));

        products.add(new Product(catAudio,
                "Soundcore by Anker Life Q30 Hybrid ANC Headphones",
                "soundcore-life-q30-anc",
                "Hi-Res certified audio, customizable EQ via mobile app, 40-hour playtime in noise-canceling mode, ultra-soft protein leather earcups on a student budget.",
                "Anker", "ANK-Q30-BLK", new BigDecimal("5999.00"), 18,
                "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80"));

        products.add(new Product(catAudio,
                "OnePlus Nord Buds 2 TWS Earbuds (25dB ANC)",
                "oneplus-nord-buds-2",
                "12.4mm dynamic titanium drivers, BassWave enhancement algorithm, 25dB active noise cancellation, and IP55 water and sweat resistance.",
                "OnePlus", "1PL-NRD-B2", new BigDecimal("2299.00"), 30,
                "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80"));

        products.add(new Product(catBooks,
                "Introduction to Algorithms (CLRS 4th Edition)",
                "clrs-algorithms-4th-edition",
                "Comprehensive algorithmic reference book by Cormen, Leiserson, Rivest, and Stein. Essential textbook for data structures, algorithms, and technical interviews.",
                "MIT Press", "BOK-CLRS-04", new BigDecimal("1899.00"), 40,
                "https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=600&q=80"));

        products.add(new Product(catBooks,
                "Operating System Concepts (Silberschatz 10th Ed)",
                "silberschatz-operating-systems-10th",
                "Standard dinosaur textbook for process management, memory paging, concurrency, virtualization, and storage systems across Linux and Windows.",
                "Wiley", "BOK-OS-SILB", new BigDecimal("995.00"), 35,
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80"));

        products.add(new Product(catBooks,
                "Computer Networking: A Top-Down Approach (Kurose & Ross)",
                "kurose-ross-computer-networking",
                "Classic top-down computer networks text exploring application protocols (HTTP, DNS) down to the physical layer with Wireshark lab assignments.",
                "Pearson", "BOK-NET-KUR", new BigDecimal("850.00"), 25,
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80"));

        products.add(new Product(catBooks,
                "Java: The Complete Reference (Herbert Schildt 12th Ed)",
                "java-complete-reference-12th",
                "Comprehensive guide to the Java language, standard libraries, collections framework, concurrency utilities, and modern Java features.",
                "McGraw Hill", "BOK-JAV-SCH", new BigDecimal("925.00"), 30,
                "https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=600&q=80"));

        products.add(new Product(catLab,
                "Raspberry Pi 4 Model B (4GB RAM Single Board Computer)",
                "raspberry-pi-4-4gb",
                "Quad core Cortex-A72 64-bit SoC, dual 4K micro-HDMI displays, Gigabit Ethernet, 2x USB 3.0 ports. Indispensable for IoT, robotics, and homelab servers.",
                "Raspberry Pi Foundation", "RPI-4B-4GB", new BigDecimal("5490.00"), 9,
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80"));

        products.add(new Product(catLab,
                "Arduino Uno R3 Starter Learning Kit with 30+ Sensors",
                "arduino-uno-r3-starter-kit",
                "ATmega328P microcontroller board bundled with breadboard, jumper wires, servo motor, ultrasonic sensor, RFID module, and tutorial booklet for embedded labs.",
                "Arduino", "ARD-UNO-STK", new BigDecimal("1850.00"), 22,
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80"));

        products.add(new Product(catLab,
                "ESP32 Wi-Fi & Bluetooth Development Board (NodeMCU)",
                "esp32-wifi-bluetooth-dev-board",
                "Dual-core Xtensa 32-bit LX6 CPU, integrated 802.11 b/g/n Wi-Fi, Bluetooth v4.2 BR/EDR & BLE. Low-cost IoT prototyping favorite for engineering final years.",
                "Espressif", "ESP-32-DEVK", new BigDecimal("480.00"), 45,
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80"));

        products.add(new Product(catStationery,
                "Casio FX-991EX ClassWiz Non-Programmable Scientific Calculator",
                "casio-fx-991ex-classwiz",
                "High-resolution LCD display, 552 functions, matrix and vector calculation, equation solver. University exam approved across all engineering branches.",
                "Casio", "CAS-FX-991EX", new BigDecimal("1495.00"), 50,
                "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&q=80"));

        products.add(new Product(catStationery,
                "Classmate Pulse Spiral Bound B5 Notebooks (Pack of 4)",
                "classmate-pulse-notebooks-pack4",
                "300 pages each, single-line ruled, high-opacity smooth 70 GSM paper. Durable poly-cover with tear-off perforated sheets for semester notes.",
                "ITC Classmate", "CLS-PLS-PK4", new BigDecimal("440.00"), 60,
                "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&q=80"));

        products.add(new Product(catStationery,
                "Pilot G2 Premium Gel Roller Pens (0.5mm, Pack of 5)",
                "pilot-g2-gel-pens-pack5",
                "Smooth-writing, smear-proof gel ink pens with comfortable contoured rubber grip. The gold standard for exam writing and lab record books.",
                "Pilot", "PLT-G2-PK5", new BigDecimal("350.00"), 75,
                "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&q=80"));

        products.add(new Product(catPeripherals,
                "Aluminum Foldable Ergonomic Laptop Stand (6-Level Height)",
                "ergonomic-aluminum-laptop-stand",
                "Sturdy aviation aluminum alloy stand with silicone anti-slip pads. Supports up to 17.3 inch laptops, improves heat ventilation, and corrects desk posture.",
                "Portronics", "PRT-LTP-STD", new BigDecimal("799.00"), 35,
                "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80"));

        products.add(new Product(catPeripherals,
                "SanDisk 1TB Extreme Portable External SSD (1050MB/s)",
                "sandisk-1tb-extreme-portable-ssd",
                "Rugged NVMe solid-state performance with up to 1050MB/s read speeds, IP55 water and dust resistance, USB-C interface. Back up all semester projects and virtual machines.",
                "SanDisk", "SND-SSD-1TB", new BigDecimal("9499.00"), 10,
                "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80"));

        List<Product> savedProducts = productRepository.saveAll(products);

        // 5. Seed a Completed Sample Order for the demo student
        Product samplePurchasedProduct = savedProducts.get(3); // Keychron K2
        Product samplePurchasedProduct2 = savedProducts.get(17); // Casio FX-991EX

        Order sampleOrder = new Order(
                "SSC-20261010-4182",
                student,
                studentAddress.getRecipientName(),
                studentAddress.getPhone(),
                "Hostel Block 4, Room 302, University Campus, Visakhapatnam, Andhra Pradesh - 530003",
                new BigDecimal("8494.00"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                new BigDecimal("8494.00"),
                PaymentMethod.SIMULATED_UPI,
                PaymentStatus.COMPLETED
        );
        sampleOrder.setOrderStatus(OrderStatus.DELIVERED);

        OrderItem orderItem1 = new OrderItem(
                sampleOrder,
                samplePurchasedProduct,
                samplePurchasedProduct.getName(),
                samplePurchasedProduct.getSku(),
                samplePurchasedProduct.getPrice(),
                1,
                samplePurchasedProduct.getPrice()
        );

        OrderItem orderItem2 = new OrderItem(
                sampleOrder,
                samplePurchasedProduct2,
                samplePurchasedProduct2.getName(),
                samplePurchasedProduct2.getSku(),
                samplePurchasedProduct2.getPrice(),
                1,
                samplePurchasedProduct2.getPrice()
        );

        sampleOrder.addItem(orderItem1);
        sampleOrder.addItem(orderItem2);
        orderRepository.save(sampleOrder);

        // 6. Seed a Verified Review on the Keychron K2
        Review review = new Review(
                student,
                samplePurchasedProduct,
                5,
                "Fantastic mechanical keyboard! The Gateron Brown switches are tactile and quiet enough for the hostel study room. Typing long Java and React assignments is effortless now."
        );
        reviewRepository.save(review);

        samplePurchasedProduct.setAverageRating(new BigDecimal("5.00"));
        samplePurchasedProduct.setReviewCount(1);
        productRepository.save(samplePurchasedProduct);

        log.info("Database seeding successfully completed with {} products, 6 categories, and 1 demo order.", savedProducts.size());
    }
}
