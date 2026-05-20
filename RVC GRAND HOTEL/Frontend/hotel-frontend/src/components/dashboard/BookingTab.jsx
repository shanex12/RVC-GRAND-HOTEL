import BookingTable from "../BookingTable";

export default function BookingTab({
  paginatedBookings,
  bookings,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  currentPage,
  totalPages,
  setCurrentPage,
  handleCheckin,
  handleCheckout,
}) {
  return (
    <div className="tab-content">

      <h2 className="section-title">
        รายชื่อการจองทั้งหมด
      </h2>

      <div className="filter-bar">

        <input
          type="text"
          placeholder="ค้นหาชื่อ / เบอร์ / ห้อง"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="filter-select"
        >

          <option value="all">
            ทุกสถานะ
          </option>

          <option value="booked">
            booked
          </option>

          <option value="checked_in">
            checked_in
          </option>

          <option value="checked_out">
            checked_out
          </option>

          <option value="cancelled">
            cancelled
          </option>

        </select>

      </div>

      <BookingTable
        bookings={paginatedBookings}
        onCheckin={handleCheckin}
        onCheckout={handleCheckout}
      />

      <div className="pagination">

        <button
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage(currentPage - 1)
          }
          className="page-button"
        >
          ⬅ ก่อนหน้า
        </button>

        <span className="page-text">
          หน้า {currentPage} / {totalPages || 1}
        </span>

        <button
          disabled={
            currentPage === totalPages ||
            totalPages === 0
          }
          onClick={() =>
            setCurrentPage(currentPage + 1)
          }
          className="page-button"
        >
          ถัดไป ➡
        </button>

      </div>

      {bookings.length === 0 && (
        <div className="empty-state">
          <p>✨ ไม่มีการจองในขณะนี้</p>
        </div>
      )}

    </div>
  );
}