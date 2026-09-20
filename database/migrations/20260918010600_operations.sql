-- Phase 2: customers, enquiries, bookings, vehicles.

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email CITEXT,
  phone TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  extras JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER customers_set_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE UNIQUE INDEX customers_email_unique
  ON customers (email)
  WHERE email IS NOT NULL AND email <> '';
CREATE INDEX customers_phone_idx ON customers (phone);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kind vehicle_kind NOT NULL DEFAULT 'safari_4x4',
  capacity INTEGER,
  description TEXT NOT NULL DEFAULT '',
  image_id UUID REFERENCES media (id) ON DELETE SET NULL,
  status content_status NOT NULL DEFAULT 'PUBLISHED',
  extras JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER vehicles_set_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers (id) ON DELETE SET NULL,
  tour_id UUID REFERENCES tours (id) ON DELETE SET NULL,
  departure_id UUID REFERENCES tour_departures (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email CITEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT 'Safari inquiry',
  message TEXT NOT NULL,
  safari_label TEXT NOT NULL DEFAULT '',
  travel_dates TEXT NOT NULL DEFAULT '',
  travellers INTEGER,
  source enquiry_source NOT NULL DEFAULT 'contact',
  status enquiry_status NOT NULL DEFAULT 'New',
  assigned_to UUID REFERENCES users (id) ON DELETE SET NULL,
  extras JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER enquiries_set_updated_at
  BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE INDEX enquiries_status_idx ON enquiries (status, created_at DESC);
CREATE INDEX enquiries_tour_idx ON enquiries (tour_id);
CREATE INDEX enquiries_email_idx ON enquiries (email);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers (id) ON DELETE SET NULL,
  tour_id UUID REFERENCES tours (id) ON DELETE SET NULL,
  departure_id UUID REFERENCES tour_departures (id) ON DELETE SET NULL,
  enquiry_id UUID REFERENCES enquiries (id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles (id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  email CITEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  safari_title TEXT NOT NULL,
  travel_date DATE,
  end_date DATE,
  travellers INTEGER,
  status booking_status NOT NULL DEFAULT 'Pending',
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  deposit_amount NUMERIC(12, 2),
  notes TEXT NOT NULL DEFAULT '',
  extras JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT bookings_dates CHECK (end_date IS NULL OR travel_date IS NULL OR end_date >= travel_date)
);

CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE INDEX bookings_status_idx ON bookings (status, travel_date);
CREATE INDEX bookings_tour_idx ON bookings (tour_id);
CREATE INDEX bookings_customer_idx ON bookings (customer_id);

CREATE TABLE booking_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email CITEXT,
  phone TEXT NOT NULL DEFAULT '',
  nationality TEXT NOT NULL DEFAULT '',
  passport_no TEXT,
  date_of_birth DATE,
  is_lead BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX booking_guests_booking_idx ON booking_guests (booking_id, sort_order);

CREATE TABLE booking_accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
  itinerary_day_id UUID REFERENCES tour_itinerary_days (id) ON DELETE SET NULL,
  accommodation_id UUID REFERENCES accommodations (id) ON DELETE SET NULL,
  name_snapshot TEXT NOT NULL DEFAULT '',
  check_in DATE,
  check_out DATE,
  nights INTEGER,
  notes TEXT NOT NULL DEFAULT ''
);

CREATE INDEX booking_accommodations_booking_idx ON booking_accommodations (booking_id);
