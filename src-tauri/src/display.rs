use std::sync::Mutex;
use std::time::Duration;
use serialport::SerialPort;
use serde::{Deserialize, Serialize};

const STX: u8 = 0x02; // Start of text
const ETX: u8 = 0x03; // End of text
const LF: u8 = 0x0A;  // Line feed (clear and start new line)

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayConfig {
    pub port_name: String,
    pub baud_rate: u32,
    pub enabled: bool,
}

impl Default for DisplayConfig {
    fn default() -> Self {
        Self {
            port_name: String::new(),
            baud_rate: 9600,
            enabled: false,
        }
    }
}

pub struct DisplayController {
    port: Mutex<Option<Box<dyn SerialPort>>>,
    config: Mutex<DisplayConfig>,
}

impl DisplayController {
    pub fn new() -> Self {
        Self {
            port: Mutex::new(None),
            config: Mutex::new(DisplayConfig::default()),
        }
    }

    pub fn configure(&self, config: DisplayConfig) -> Result<(), String> {
        let mut port_lock = self.port.lock().map_err(|e| e.to_string())?;
        let mut config_lock = self.config.lock().map_err(|e| e.to_string())?;

        // Close existing connection
        *port_lock = None;

        if config.enabled && !config.port_name.is_empty() {
            // Open new serial port
            let port = serialport::new(&config.port_name, config.baud_rate)
                .timeout(Duration::from_millis(100))
                .data_bits(serialport::DataBits::Eight)
                .stop_bits(serialport::StopBits::One)
                .parity(serialport::Parity::None)
                .open()
                .map_err(|e| format!("Failed to open serial port: {}", e))?;

            *port_lock = Some(port);
        }

        *config_lock = config;
        Ok(())
    }

    pub fn get_config(&self) -> Result<DisplayConfig, String> {
        let config = self.config.lock().map_err(|e| e.to_string())?;
        Ok(config.clone())
    }

    pub fn list_ports() -> Result<Vec<String>, String> {
        let ports = serialport::available_ports()
            .map_err(|e| format!("Failed to list serial ports: {}", e))?;
        
        Ok(ports.into_iter().map(|p| p.port_name).collect())
    }

    /// Format een getal als 4-karakter display string
    /// Bijvoorbeeld: 750 -> "0750", 0 -> "   0"
    fn format_display_value(value: i32) -> String {
        if value < 0 {
            // Negatieve waarden: "-123" (max -999)
            format!("{:>4}", value.max(-999))
        } else if value >= 10000 {
            // Te groot voor 4 cijfers: toon "9999"
            "9999".to_string()
        } else {
            // Normale waarden: rechtstreeks met leading zeros
            format!("{:04}", value)
        }
    }

    /// Update alle displays met nieuwe waarden
    /// Layout: [Player1(4)] [Player2(4)] [Player3(4)] [Pot(4)] = 16 characters
    pub fn update_displays(
        &self,
        player1_balance: i32,
        player2_balance: i32,
        player3_balance: i32,
        pot: i32,
    ) -> Result<(), String> {
        let config = self.config.lock().map_err(|e| e.to_string())?;
        
        if !config.enabled {
            return Ok(()); // Display disabled, skip silently
        }

        let mut port_lock = self.port.lock().map_err(|e| e.to_string())?;
        
        if let Some(port) = port_lock.as_mut() {
            // Format alle waarden
            let p1 = Self::format_display_value(player1_balance);
            let p2 = Self::format_display_value(player2_balance);
            let p3 = Self::format_display_value(player3_balance);
            let pot_str = Self::format_display_value(pot);

            // Bouw het volledige bericht: 16 karakters
            let message = format!("{}{}{}{}", p1, p2, p3, pot_str);

            // Verzend: LF + STX + message + ETX
            // LF wist het vorige bericht
            let mut data = vec![LF, STX];
            data.extend_from_slice(message.as_bytes());
            data.push(ETX);

            port.write_all(&data)
                .map_err(|e| format!("Failed to write to serial port: {}", e))?;
            
            port.flush()
                .map_err(|e| format!("Failed to flush serial port: {}", e))?;

            Ok(())
        } else {
            Err("Serial port not connected".to_string())
        }
    }

    /// Test functie om de displays te testen
    pub fn test_displays(&self) -> Result<(), String> {
        self.update_displays(8888, 7777, 6666, 5555)
    }

    /// Clear alle displays (toon "    " = 4 spaties per display)
    pub fn clear_displays(&self) -> Result<(), String> {
        let config = self.config.lock().map_err(|e| e.to_string())?;
        
        if !config.enabled {
            return Ok(());
        }

        let mut port_lock = self.port.lock().map_err(|e| e.to_string())?;
        
        if let Some(port) = port_lock.as_mut() {
            // 16 spaties
            let message = "                ";
            
            let mut data = vec![LF, STX];
            data.extend_from_slice(message.as_bytes());
            data.push(ETX);

            port.write_all(&data)
                .map_err(|e| format!("Failed to write to serial port: {}", e))?;
            
            port.flush()
                .map_err(|e| format!("Failed to flush serial port: {}", e))?;

            Ok(())
        } else {
            Err("Serial port not connected".to_string())
        }
    }
}

