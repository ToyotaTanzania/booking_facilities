
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface BookingConfirmationEmailProps {
  username: string;
  facilityName: string;
  startsAt: string; // formatted date/time string
  endsAt: string; // formatted date/time string
  bookingsUrl: string;
}

export const BookingConfirmationEmail = ({
  username,
  facilityName,
  startsAt,
  endsAt,
  bookingsUrl,
}: BookingConfirmationEmailProps) => (
  <Html>
    <Head>
      <link
        href="https://fonts.googleapis.com/css2?family=Red+Hat+Text:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
    </Head>
    <Tailwind>
      <Body className="bg-white font-sans" style={{ fontFamily: '"Red Hat Text", Arial, sans-serif' }}>
        <Preview>Your facility booking is confirmed</Preview>
        <Container className="mx-auto py-5 pb-12">
          <Img
            src={`https://ik.imagekit.io/ttltz/brands/one/one-colored_H32SW3x_4.png?updatedAt=1757667292237`}
            width="170"
            height="50"
            alt="Karimjee Group"
            className="mx-auto"
          />
          <Text className="text-[16px] leading-[26px]">Hi {username},</Text>
          <Text className="text-[16px] leading-[26px]">
            Your booking has been made for <strong>{facilityName}</strong>.
          </Text>
          <Text className="text-[16px] leading-[26px]">
            From <strong>{startsAt}</strong> to <strong>{endsAt}</strong>.
          </Text>
          <Section className="text-center mt-4">
            <Button
              className="bg-[#184377] rounded-[3px] text-white text-[16px] no-underline text-center block p-3"
              href={bookingsUrl}
            >
              View your bookings
            </Button>
          </Section>
          <Text className="text-[14px] leading-[24px] text-[#4a5568] mt-4">
            If the button doesn’t work, copy and paste this link into your
            browser: {bookingsUrl}
          </Text>
          <Hr className="border-[#cccccc] my-5" />
          <Text className="text-[#8898aa] text-[12px]">
            This is an automated message for booking confirmations.
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

BookingConfirmationEmail.PreviewProps = {
  username: 'Feisal',
  facilityName: 'Executive Boardroom',
  startsAt: 'Mon, Nov 24, 10:00 AM',
  endsAt: 'Mon, Nov 24, 12:00 PM',
  bookingsUrl: 'https://boardrooms.karimjee.com/bookings',
} as BookingConfirmationEmailProps;

export default BookingConfirmationEmail;
