import "../../styles/ConfirmBookingModal.css";

export default function ConfirmBookingModal({
    show,
    room,
    checkInDate,
    checkOutDate,
    totalPrice,
    nights,
    onClose,
    onConfirm,
}) {
    if (!show) return null;
    const formatThaiDate = (date) => {
        return new Date(date).toLocaleDateString(
            "th-TH",
            {
                day: "numeric",
                month: "long",
                year: "numeric",
            }
        );
    };

    return (
        <div
            className="confirm-overlay"
            onClick={onClose}
        >
            <div
                className="confirm-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <h2>🏨 ยืนยันการจอง</h2>
                <p className="confirm-subtitle">
                    ตรวจสอบรายละเอียดก่อนดำเนินการ
                </p>

                <div className="confirm-card">

                    <h3>ห้อง {room.name}</h3>

                    <p>📅 {formatThaiDate(checkInDate)}</p>
                    <p>📅 {formatThaiDate(checkOutDate)}</p>

                    <p>🌙 {nights} คืน</p>

                    <div className="confirm-total">
                        <span>ยอดชำระทั้งหมด</span>

                        <h1>
                            ฿{totalPrice}
                        </h1>
                    </div>

                </div>

                <div className="confirm-actions">

                    <button
                        className="confirm-cancel"
                        onClick={onClose}
                    >
                        ยกเลิก
                    </button>

                    <button
                        className="confirm-submit"
                        onClick={onConfirm}
                    >
                        ยืนยันการจอง
                    </button>

                </div>
            </div>
        </div>
    );
}